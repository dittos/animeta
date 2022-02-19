import { TimestampSigner } from "./timestamp_signer"
import base64url from "base64url"
import * as zlib from "zlib"

interface Serializer<T> {
  serialize(obj: T): Buffer
  deserialize(data: Buffer): T
}

export class Signing {
  static loadString<T>(s: string, key: string, salt: string, serializer: Serializer<T>, maxAgeMs: number | null): T {
    let base64d = new TimestampSigner(key, salt).unsign(s, maxAgeMs)
    let decompress = false
    if (base64d.startsWith(".")) {
      base64d = base64d.substring(1)
      decompress = true
    }
    let data = base64url.toBuffer(base64d)
    if (decompress) {
      data = this.decompress(data)
    }
    return serializer.deserialize(data)
  }

  static toString<T>(obj: T, key: string, salt: string, serializer: Serializer<T>, compress: boolean): string {
    let data = serializer.serialize(obj)
    let isCompressed = false
    if (compress) {
      let compressed = this.compress(data)
      if (compressed.length < data.length - 1) {
        data = compressed
        isCompressed = true
      }
    }
    let base64d = base64url.encode(data)
    if (isCompressed) {
      base64d = "." + base64d
    }
    return new TimestampSigner(key, salt).sign(base64d)
  }
  
  private static decompress(compressed: Buffer): Buffer {
    return zlib.inflateSync(compressed)    
  }

  private static compress(data: Buffer): Buffer {
    return zlib.deflateSync(data)
  }
}
