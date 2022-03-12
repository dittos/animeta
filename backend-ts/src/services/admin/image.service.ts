import { Injectable } from "@nestjs/common";
import got from 'got'
import * as fs from 'fs'
import { pipeline } from 'stream';
import { promisify } from "util";
import { spawn } from "child_process";
import { Storage, Bucket } from '@google-cloud/storage';
import { ConfigService } from "@nestjs/config";
import { getAnnMetadata } from "./ann_metadata_cache";
import cheerio from 'cheerio';

const pipelinePromise = promisify(pipeline)

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

@Injectable()
export class ImageService {
  private storage: Storage
  private mediaStorageBucket: Bucket
  private mediaStorageBasePath: string

  constructor(configService: ConfigService) {
    this.storage = new Storage()
    const mediaStorageUrl = new URL(configService.get('ANIMETA_MEDIA_STORAGE_URL')!)
    if (mediaStorageUrl.protocol !== 'gs:')
      throw new Error(`Unsupported storage: ${mediaStorageUrl.protocol}`)
    this.mediaStorageBucket = this.storage.bucket(mediaStorageUrl.hostname)
    this.mediaStorageBasePath = normalizeBasePath(mediaStorageUrl.pathname)
  }

  async downloadAnnPoster(annId: string, outFile: string) {
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
    await this.download(fullsrc.replace('http://', 'https://'), outFile)
  }

  async download(url: string, dest: string) {
    await pipelinePromise(
      got.get(url, {isStream: true}),
      fs.createWriteStream(dest)
    )
  }

  async generateThumbnail(file: string, thumbFile: string, removeAnnWatermark: boolean = false) {
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

  async upload(source: string, path: string) {
    await this.mediaStorageBucket
      .upload(source, {destination: this.mediaStorageBasePath + path})
  }
}
