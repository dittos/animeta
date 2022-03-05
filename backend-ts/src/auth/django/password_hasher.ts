export interface PasswordHasher {
  algorithm(): string;

  /** Generate a cryptographically secure nonce salt in ASCII. */
  salt(): Buffer;

  /**
   * Check if the given password is correct.
   *
   * @param password
   * @param encoded
   */
  verify(password: string, encoded: string): Promise<boolean>;

  /**
   * Create an encoded database value.
   *
   * The result is normally formatted as "algorithm$salt$hash" and
   * must be fewer than 128 characters.
   *
   * @param password
   * @param salt
   */
  encode(password: string, salt: Buffer): Promise<string>;

  mustUpdate(encoded: string): boolean;

  /**
   * Bridge the runtime gap between the work factor supplied in `encoded`
   * and the work factor suggested by this hasher.
   *
   * Taking PBKDF2 as an example, if `encoded` contains 20000 iterations and
   * `self.iterations` is 30000, this method should run password through
   * another 10000 iterations of PBKDF2. Similar approaches should exist
   * for any hasher that has a work factor. If not, this method should be
   * defined as a no-op to silence the warning.
   *
   * @param password
   * @param encoded
   */
  hardenRuntime(password: string, encoded: string): Promise<void>;
}
