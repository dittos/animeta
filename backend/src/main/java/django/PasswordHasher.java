package django;

public interface PasswordHasher {
    String algorithm();

    /** Generate a cryptographically secure nonce salt in ASCII. */
    byte[] salt();

    /**
     * Check if the given password is correct.
     *
     * @param password
     * @param encoded
     */
    boolean verify(char[] password, String encoded);

    /**
     * Create an encoded database value.
     *
     * The result is normally formatted as "algorithm$salt$hash" and
     * must be fewer than 128 characters.
     *
     * @param password
     * @param salt
     */
    String encode(char[] password, byte[] salt);

    boolean mustUpdate(String encoded);

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
    void hardenRuntime(char[] password, String encoded);
}
