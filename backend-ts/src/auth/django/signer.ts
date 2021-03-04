import { createHash, createHmac, timingSafeEqual } from "crypto"
import base64url from "base64url"

class BadSignature extends Error {}

export class Signer {
  protected static SEPARATOR = ":"

  constructor(protected key: string, protected salt: string) {}

  private signature(value: string): string {
    return Signer.base64Hmac(this.salt + "signer", Buffer.from(value), this.key)
  }

  public sign(value: string): string {
    return value + Signer.SEPARATOR + this.signature(value)
  }

  public unsign(signedValue: string): string {
    const sepIndex = signedValue.lastIndexOf(Signer.SEPARATOR)
    if (sepIndex < 0) {
      throw new BadSignature("No \"" + Signer.SEPARATOR + "\" found in value")
    }
    const value = signedValue.substring(0, sepIndex)
    const sig = signedValue.substring(sepIndex + Signer.SEPARATOR.length)
    if (timingSafeEqual(Buffer.from(sig), Buffer.from(this.signature(value)))) {
      return value
    }
    throw new BadSignature("Signature \"" + sig + "\" does not match")
  }

  private static base64Hmac(salt: string, value: Buffer, key: string): string {
    const hash = createHash('sha1').update(salt + key).digest()
    const hmac = createHmac('sha1', hash).update(value).digest()
    return base64url.encode(hmac)
  }
}
