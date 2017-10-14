package django;

public class Signer {
    protected final String SEPARATOR = ":";

    protected final String key;
    protected final String salt;

    public Signer(String key, String salt) {
        this.key = key;
        this.salt = salt;
    }

    public String signature(String value) {
        return base64Hmac(salt + "signer", value.getBytes(), key);
    }

    public String unsign(String signedValue) {
        int sepIndex = signedValue.lastIndexOf(SEPARATOR);
        if (sepIndex < 0) {
            throw new BadSignature("No \"" + SEPARATOR + "\" found in value");
        }
        String value = signedValue.substring(0, sepIndex);
        String sig = signedValue.substring(sepIndex + SEPARATOR.length());
        if (Crypto.constantTimeCompare(sig, signature(value))) {
            return value;
        }
        throw new BadSignature("Signature \"" + sig + "\" does not match");
    }

    private static String base64Hmac(String salt, byte[] value, String key) {
        return Signing.BASE64.encode(Crypto.saltedHmac(salt, value, key));
    }
}
