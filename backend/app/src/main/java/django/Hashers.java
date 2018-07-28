package django;

import com.google.common.base.Preconditions;
import com.google.common.collect.ImmutableList;
import com.google.common.hash.Hashing;
import com.google.common.io.BaseEncoding;

import javax.annotation.Nullable;
import java.nio.charset.StandardCharsets;
import java.util.List;

import static com.google.common.primitives.Bytes.indexOf;

public final class Hashers {
    private Hashers() {}

    public static final PasswordHasher PBKDF2 = new PBKDF2PasswordHasher();
    public static final PasswordHasher SHA1 = new SHA1PasswordHasher();
    public static final List<PasswordHasher> HASHERS = ImmutableList.of(PBKDF2, SHA1);
    private static final PasswordHasher PREFERRED_HASHER = HASHERS.get(0);

    public enum CheckPasswordResult {
        CORRECT,
        CORRECT_BUT_MUST_UPDATE,
        INCORRECT,
    }

    public static CheckPasswordResult checkPassword(char[] password, String encoded) {
        return checkPassword(password, encoded, PREFERRED_HASHER);
    }

    public static CheckPasswordResult checkPassword(char[] password, String encoded, PasswordHasher preferred) {
        PasswordHasher hasher = identifyHasher(encoded);
        boolean hasherChanged = !hasher.algorithm().equals(preferred.algorithm());
        boolean mustUpdate = hasherChanged || preferred.mustUpdate(encoded);
        boolean isCorrect = hasher.verify(password, encoded);

        // If the hasher didn't change (we don't protect against enumeration if it
        // does) and the password should get updated, try to close the timing gap
        // between the work factor of the current encoded password and the default
        // work factor.
        if (!isCorrect && !hasherChanged && mustUpdate) {
            hasher.hardenRuntime(password, encoded);
        }

        if (isCorrect && mustUpdate) {
            return CheckPasswordResult.CORRECT_BUT_MUST_UPDATE;
        }

        return isCorrect ? CheckPasswordResult.CORRECT : CheckPasswordResult.INCORRECT;
    }

    private static PasswordHasher identifyHasher(String encoded) {
        int index = encoded.indexOf('$');
        if (index == -1) {
            throw new IllegalArgumentException();
        }
        String algorithm = encoded.substring(0, index);
        return HASHERS.stream().filter(it -> it.algorithm().equals(algorithm)).findFirst().get();
    }

    public static String makePassword(char[] password, @Nullable byte[] salt) {
        return makePassword(password, salt, PREFERRED_HASHER);
    }

    /**
     * Turn a plain-text password into a hash for database storage
     *
     * @param password
     * @param salt
     * @param hasher
     * @return
     */
    public static String makePassword(char[] password, @Nullable byte[] salt, PasswordHasher hasher) {
        if (salt == null) {
            salt = hasher.salt();
        }

        return hasher.encode(password, salt);
    }

    private static abstract class BasePasswordHasher implements PasswordHasher {
        @Override
        public byte[] salt() {
            return Crypto.getRandomString();
        }

        @Override
        public boolean mustUpdate(String encoded) {
            return false;
        }
    }

    private static class PBKDF2PasswordHasher extends BasePasswordHasher {
        public static final String ALGORITHM = "pbkdf2_sha256";
        private final int iterations;

        public PBKDF2PasswordHasher() {
            this(100000);
        }

        public PBKDF2PasswordHasher(int iterations) {
            this.iterations = iterations;
        }

        @Override
        public String algorithm() {
            return ALGORITHM;
        }

        @Override
        public String encode(char[] password, byte[] salt) {
            return encode(password, salt, iterations);
        }

        private String encode(char[] password, byte[] salt, int iterations) {
            Preconditions.checkNotNull(password);
            Preconditions.checkNotNull(salt);
            Preconditions.checkArgument(indexOf(salt, (byte) '$') == -1, "'$' not in salt");
            byte[] hashBytes = Crypto.pbkdf2(password, salt, iterations);
            String hash = BaseEncoding.base64().encode(hashBytes);
            return ALGORITHM + "$" + iterations + "$" + new String(salt) + "$" + hash;
        }

        @Override
        public boolean verify(char[] password, String encoded) {
            String[] parts = encoded.split("\\$", 4);
            String algorithm = parts[0];
            int iterations = Integer.parseInt(parts[1]);
            byte[] salt = parts[2].getBytes();
            Preconditions.checkArgument(algorithm.equals(ALGORITHM));
            String encoded2 = encode(password, salt, iterations);
            return Crypto.constantTimeCompare(encoded, encoded2);
        }

        @Override
        public boolean mustUpdate(String encoded) {
            String[] parts = encoded.split("\\$", 4);
            int iterations = Integer.parseInt(parts[1]);
            return iterations != this.iterations;
        }

        @Override
        public void hardenRuntime(char[] password, String encoded) {
            String[] parts = encoded.split("\\$", 4);
            int iterations = Integer.parseInt(parts[1]);
            byte[] salt = parts[2].getBytes();
            int extraIterations = this.iterations - iterations;
            if (extraIterations > 0) {
                encode(password, salt, extraIterations);
            }
        }
    }

    private static class SHA1PasswordHasher extends BasePasswordHasher {
        public static final String ALGORITHM = "sha1";

        @Override
        public String algorithm() {
            return ALGORITHM;
        }

        @Override
        public String encode(char[] password, byte[] salt) {
            Preconditions.checkNotNull(password);
            Preconditions.checkNotNull(salt);
            Preconditions.checkArgument(indexOf(salt, (byte) '$') == -1, "'$' not in salt");
            byte[] hashBytes = Hashing.sha1().newHasher()
                    .putBytes(salt)
                    .putBytes(new String(password).getBytes(StandardCharsets.UTF_8))
                    .hash().asBytes();
            String hash = BaseEncoding.base32Hex().encode(hashBytes);
            return ALGORITHM + "$" + new String(salt) + "$" + hash;
        }

        @Override
        public boolean verify(char[] password, String encoded) {
            String[] parts = encoded.split("\\$", 4);
            String algorithm = parts[0];
            byte[] salt = parts[1].getBytes();
            Preconditions.checkArgument(algorithm.equals(ALGORITHM));
            String encoded2 = encode(password, salt);
            return Crypto.constantTimeCompare(encoded, encoded2);
        }

        @Override
        public void hardenRuntime(char[] password, String encoded) {
        }
    }
}
