import { BaseConverter } from "./base_converter";
import { Signer } from "./signer";

export class SignatureExpired extends Error {}

export class TimestampSigner extends Signer {
  public sign(value: string): string {
    value = value + Signer.SEPARATOR + this.timestamp()
    return super.sign(value)
  }

  private timestamp(): string {
    return BaseConverter.BASE62.encode(Date.now() / 1000)
  }

  public unsign(signedValue: string, maxAgeMs?: number): string {
    const result = super.unsign(signedValue)
    const parts = result.split(Signer.SEPARATOR, 2)
    const value = parts[0]
    const timestamp = BaseConverter.BASE62.decode(parts[1]) * 1000
    if (maxAgeMs != null) {
      // Check timestamp is not older than max_age
      const expiry = timestamp + maxAgeMs
      if (Date.now() > expiry) {
        throw new SignatureExpired("signature expired")
      }
    }
    return value;
  }
}
