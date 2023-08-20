import { User } from "src/entities/user.entity";
import { MoreThan } from "typeorm";
import * as tempy from "tempy";
import * as fs from "fs";
import { pipeline } from 'stream/promises';
import { Storage } from '@google-cloud/storage';
import { stringify as csvStringify } from 'csv-stringify';
import { History } from "src/entities/history.entity";
import { StatusType } from "src/entities/status_type";
import { db } from "src2/database";

const storage = new Storage()
const backupStorageUrl = new URL(process.env.ANIMETA_BACKUP_STORAGE_URL!)
if (backupStorageUrl.protocol !== 'gs:')
  throw new Error(`Unsupported storage: ${backupStorageUrl.protocol}`)
const backupStorageBucket = storage.bucket(backupStorageUrl.hostname)
const backupStorageBasePath = normalizeBasePath(backupStorageUrl.pathname)

export async function createBackup(user: User): Promise<string> {
  return await tempy.file.task(async tempFile => {
    await pipeline(
      userHistoryCsvRows(user),
      csvStringify({
        header: true,
        columns: ["id", "title", "category", "status", "status_type", "comment", "updated_at", "contains_spoiler", "rating"],
        bom: true,
        quoted: true,
      }),
      fs.createWriteStream(tempFile)
    )
    const path = `animeta_backup_${user.username}_${new Date().toJSON().replace(/[^0-9]/g, '')}.csv`
    const [file] = await backupStorageBucket.upload(tempFile, {
      destination: backupStorageBasePath + path,
      contentType: 'text/csv',
      gzip: true,
      metadata: {
        contentDisposition: `attachment; filename=${path}`,
      }
    })
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 60 * 60 * 24,
    })
    return url
  })
}

function normalizeBasePath(basePath: string): string {
  if (basePath[0] === '/')
    basePath = basePath.substring(1)

  if (basePath === '')
    return ''
  
  if (basePath[basePath.length - 1] !== '/')
    return basePath + '/'
  else
    return basePath
}

async function* userHistoryCsvRows(user: User) {
  const batchSize = 1024
  let lastId = 0
  while (true) {
    const histories = await db.find(History, {
      relations: ['record', 'record.category'],
      where: {
        user,
        id: MoreThan(lastId),
      },
      order: { id: 'ASC' },
      take: batchSize,
    })
    if (histories.length === 0) break
    lastId = histories[histories.length - 1].id
    yield* histories.map(it => [
      it.id, it.record.title, it.record.category?.name ?? '',
      it.status, StatusType[it.status_type], it.comment,
      it.updated_at ? it.updated_at.toJSON() : '',
      it.contains_spoiler ? 'true' : 'false',
      it.record.rating ?? '',
    ])
  }
}
