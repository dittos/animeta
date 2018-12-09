package django;

import com.google.common.hash.Hashing;

import javax.crypto.Mac;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.KeySpec;
import java.util.Objects;

public class Crypto {
    private static final String HMAC_SHA1_ALGORITHM = "HmacSHA1";
    private static final byte[] DEFAULT_ALLOWED_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".getBytes();
    private static final SecureRandom SECURE_RANDOM;

    static {
        SECURE_RANDOM = new SecureRandom();
    }

    public static byte[] saltedHmac(String keySalt, byte[] value, String secret) {
        byte[] key = Hashing.sha1().hashString(keySalt + secret, StandardCharsets.UTF_8).asBytes();
        try {
            Mac mac = Mac.getInstance(HMAC_SHA1_ALGORITHM);
            mac.init(new SecretKeySpec(key, HMAC_SHA1_ALGORITHM));
            return mac.doFinal(value);
        } catch (GeneralSecurityException e) {
            throw new RuntimeException(e);
        }
    }

    public static byte[] getRandomString() {
        return getRandomString(12);
    }

    public static byte[] getRandomString(int length) {
        return getRandomString(length, DEFAULT_ALLOWED_CHARS);
    }

    public static byte[] getRandomString(int length, byte[] allowedChars) {
        byte[] buf = new byte[length];
        for (int i = 0; i < length; i++) {
            buf[i] = allowedChars[SECURE_RANDOM.nextInt(allowedChars.length)];
        }
        return buf;
    }

    public static boolean constantTimeCompare(String a, String b) {
        Objects.requireNonNull(a);
        Objects.requireNonNull(b);
        if (a.length() != b.length()) {
            return false;
        }

        int result = 0;
        int len = a.length();
        for (int i = 0; i < len; i++) {
            result |= a.charAt(i) ^ b.charAt(i);
        }
        return result == 0;
    }

    public static byte[] pbkdf2(char[] password, byte[] salt, int iterations) {
        try {
            KeySpec spec = new PBEKeySpec(password, salt, iterations, 256);
            SecretKeyFactory skf = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
            return skf.generateSecret(spec).getEncoded();
        } catch (NoSuchAlgorithmException | InvalidKeySpecException e) {
            throw new IllegalStateException(e);
        }
    }
}
