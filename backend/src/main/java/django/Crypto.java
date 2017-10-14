package django;

import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.util.Objects;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import com.google.common.hash.Hashing;

public class Crypto {
    private static final String HMAC_SHA1_ALGORITHM = "HmacSHA1";

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
}
