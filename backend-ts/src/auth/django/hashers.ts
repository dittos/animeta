import { PasswordHasher } from "./password_hasher";
import { getRandomString } from "./crypto";
import { createHash, pbkdf2, timingSafeEqual } from "crypto";
import { promisify } from "util";
import base32Encode from 'base32-encode'

export enum CheckPasswordResult {
  CORRECT,
  CORRECT_BUT_MUST_UPDATE,
  INCORRECT,
}

export function checkPassword(password: string, encoded: string): Promise<CheckPasswordResult> {
  return checkPasswordWithHasher(password, encoded, PREFERRED_HASHER)
}

export async function checkPasswordWithHasher(password: string, encoded: string, preferred: PasswordHasher): Promise<CheckPasswordResult> {
  const hasher = identifyHasher(encoded)
  const hasherChanged = hasher.algorithm() !== preferred.algorithm()
  const mustUpdate = hasherChanged || preferred.mustUpdate(encoded)
  const isCorrect = await hasher.verify(password, encoded)

  // If the hasher didn't change (we don't protect against enumeration if it
  // does) and the password should get updated, try to close the timing gap
  // between the work factor of the current encoded password and the default
  // work factor.
  if (!isCorrect && !hasherChanged && mustUpdate) {
    hasher.hardenRuntime(password, encoded)
  }

  if (isCorrect && mustUpdate) {
    return CheckPasswordResult.CORRECT_BUT_MUST_UPDATE
  }

  return isCorrect ? CheckPasswordResult.CORRECT : CheckPasswordResult.INCORRECT
}

function identifyHasher(encoded: string): PasswordHasher {
  const index = encoded.indexOf('$')
  if (index === -1)
    throw new Error('invalid format')
  const algorithm = encoded.substring(0, index)
  const hasher = HASHERS.find(it => it.algorithm() === algorithm)
  if (!hasher)
    throw new Error(`invalid algorithm: ${algorithm}`)
  return hasher
}

/**
 * Turn a plain-text password into a hash for database storage
 *
 * @param password
 * @param salt
 * @param hasher
 * @return
 */
export async function makePassword(
  password: string,
  salt: Buffer | null,
  hasher: PasswordHasher = PREFERRED_HASHER
): Promise<string> {
  if (!salt) salt = hasher.salt()
  return hasher.encode(password, salt)
}

abstract class BasePasswordHasher implements PasswordHasher {
  abstract algorithm(): string
  abstract verify(password: string, encoded: string): Promise<boolean>
  abstract encode(password: string, salt: Buffer): Promise<string>
  abstract hardenRuntime(password: string, encoded: string): Promise<void>
  
  salt(): Buffer {
    return getRandomString()
  }

  mustUpdate(encoded: string): boolean {
    return false
  }
}

class PBKDF2PasswordHasher extends BasePasswordHasher {
  static ALGORITHM = 'pbkdf2_sha256'
  static pbkdf2 = promisify(pbkdf2)

  constructor(private iterations: number = 100000) {
    super()
  }

  algorithm() {
    return PBKDF2PasswordHasher.ALGORITHM
  }

  async encode(
    password: string,
    salt: Buffer,
    iterations: number = this.iterations
  ): Promise<string> {
    if (salt.includes('$'))
      throw new Error("salt should not contain '$'")
    const hashBytes = await PBKDF2PasswordHasher.pbkdf2(password, salt, iterations, 256 / 8, 'sha256')
    const hash = hashBytes.toString('base64')
    return PBKDF2PasswordHasher.ALGORITHM + '$' + iterations + '$' + salt.toString('ascii') + '$' + hash
  }

  async verify(password: string, encoded: string): Promise<boolean> {
    const [algorithm, iterationsStr, saltStr, ] = encoded.split('$', 4)
    const iterations = Number(iterationsStr)
    const salt = Buffer.from(saltStr)
    if (algorithm !== PBKDF2PasswordHasher.ALGORITHM)
      throw new Error('invalid algorithm')
    const encoded2 = await this.encode(password, salt, iterations)
    return timingSafeEqual(Buffer.from(encoded), Buffer.from(encoded2))
  }
  
  mustUpdate(encoded: string): boolean {
    const parts = encoded.split('$', 4)
    const iterations = Number(parts[1])
    return iterations !== this.iterations
  }

  async hardenRuntime(password: string, encoded: string): Promise<void> {
    const parts = encoded.split('$', 4)
    const iterations = Number(parts[1])
    const salt = Buffer.from(parts[2])
    const extraIterations = this.iterations - iterations
    if (extraIterations > 0)
      await this.encode(password, salt, extraIterations)
  }
}

class SHA1PasswordHasher extends BasePasswordHasher {
  static ALGORITHM = 'sha1'

  algorithm() {
    return SHA1PasswordHasher.ALGORITHM
  }

  async encode(
    password: string,
    salt: Buffer
  ): Promise<string> {
    if (salt.includes('$'))
      throw new Error("salt should not contain '$'")
    const hashBytes = createHash('sha1')
      .update(salt)
      .update(password, 'utf8')
      .digest()
    const hash = base32Encode(hashBytes, 'RFC4648-HEX')
    return SHA1PasswordHasher.ALGORITHM + '$' + salt.toString('ascii') + '$' + hash
  }

  async verify(password: string, encoded: string): Promise<boolean> {
    const [algorithm, saltStr, ] = encoded.split('$', 4)
    const salt = Buffer.from(saltStr)
    if (algorithm !== SHA1PasswordHasher.ALGORITHM)
      throw new Error('invalid algorithm')
    const encoded2 = await this.encode(password, salt)
    return timingSafeEqual(Buffer.from(encoded), Buffer.from(encoded2))
  }

  async hardenRuntime(password: string, encoded: string): Promise<void> {
  }
}

export const PBKDF2: PasswordHasher = new PBKDF2PasswordHasher()
export const SHA1: PasswordHasher = new SHA1PasswordHasher()
export const HASHERS: PasswordHasher[] = [PBKDF2, SHA1]
export const PREFERRED_HASHER = HASHERS[0]