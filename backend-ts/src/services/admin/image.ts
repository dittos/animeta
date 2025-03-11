import got from 'got'
import * as fs from 'fs'
import { pipeline } from 'stream/promises';
import { spawn } from "child_process";
import { Storage } from '@google-cloud/storage';
import * as tempy from "tempy";
import * as cuid from "cuid";
import { getAnnMetadata } from "./ann";
import cheerio from 'cheerio';
import { db } from 'src/database';
import { Work } from 'src/entities/work.entity';

const storage = new Storage()
const mediaStorageUrl = new URL(process.env.ANIMETA_MEDIA_STORAGE_URL!)
if (mediaStorageUrl.protocol !== 'gs:')
  throw new Error(`Unsupported storage: ${mediaStorageUrl.protocol}`)
const mediaStorageBucket = storage.bucket(mediaStorageUrl.hostname)
const mediaStorageBasePath = normalizeBasePath(mediaStorageUrl.pathname)

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

export async function downloadAnnPoster(annId: string, outFile: string) {
  const anime = await getAnnMetadata(annId)
  const images = anime.find('info[type="Picture"] img')
  let fullsrc: string | null = null
  for (const image of images.toArray()) {
    let src = cheerio(image).attr('src')
    if (!src) continue
    if (src.includes('full'))
      fullsrc = src
    else if (src.includes('max') && !fullsrc)
      fullsrc = src
  }
  if (!fullsrc)
    throw Error('full image url not found')
  await download(fullsrc.replace('http://', 'https://'), outFile)
}

export async function download(url: string, dest: string) {
  await pipeline(
    got.get(url, {isStream: true}),
    fs.createWriteStream(dest)
  )
}

export async function generateThumbnail(file: string, thumbFile: string, removeAnnWatermark: boolean = false) {
  let w = 233
  let h = 318
  const annWatermarkHeight = 13

  // Retina
  w *= 2
  h *= 2

  const args = [file]
  if (removeAnnWatermark) {
    args.push('-crop', `+0-${annWatermarkHeight}`)
  }
  args.push("-resize", `${w}x${h}^`)
  args.push("-gravity", "north")
  args.push("-crop", `${w}x${h}+0+0`)
  args.push(thumbFile)

  const exitCode = await new Promise((resolve, reject) => {
    const proc = spawn('convert', args, {stdio: 'inherit'})
    proc.on('error', err => reject(err))
    proc.on('close', code => resolve(code))
  })
  if (exitCode !== 0)
    throw new Error('resize failed')
  
  try {
    await new Promise((resolve, reject) => {
      const proc = spawn('jpegoptim', ["--max", "40", "--totals", thumbFile], {stdio: 'inherit'})
      proc.on('error', err => reject(err))
      proc.on('close', code => resolve(code))
    })
  } catch (e) {
    // ignore
  }
}

export async function upload(source: string, path: string) {
  await mediaStorageBucket
    .upload(source, {destination: mediaStorageBasePath + path})
}

export async function crawlImage(
  work: Work,
  options: { source: 'ann', annId: string } | { source: 'url', url: string }
): Promise<void> {
  await tempy.file.task(async tempFile => {
    await tempy.file.task(async tempThumbFile => {
      switch (options.source) {
        case 'ann':
          await downloadAnnPoster(options.annId, tempFile)
          await generateThumbnail(tempFile, tempThumbFile)
          work.original_image_filename = `ann${options.annId}.jpg`
          work.image_filename = `thumb/v2/${work.original_image_filename}`
          await upload(tempFile, work.original_image_filename)
          await upload(tempThumbFile, work.image_filename)
          await db.save(work)
          break;
        case 'url':
          await download(options.url, tempFile)
          await generateThumbnail(tempFile, tempThumbFile)
          work.original_image_filename = cuid()
          work.image_filename = `thumb/${work.original_image_filename}`
          await upload(tempFile, work.original_image_filename)
          await upload(tempThumbFile, work.image_filename)
          await db.save(work)
          break;
      }
    }, {extension: 'jpg'})
  })
}
