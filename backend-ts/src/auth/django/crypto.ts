import { randomInt } from 'crypto'

const DEFAULT_ALLOWED_CHARS = Buffer.from("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")

export function getRandomString(
  length: number = 12,
  allowedChars: Buffer = DEFAULT_ALLOWED_CHARS
): Buffer {
  const buf = Buffer.allocUnsafe(length)
  for (let i = 0; i < length; i++) {
    buf[i] = allowedChars[randomInt(allowedChars.length)]
  }
  return buf
}
