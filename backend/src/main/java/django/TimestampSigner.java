package django;

public class TimestampSigner extends Signer {
    public TimestampSigner(String key, String salt) {
        super(key, salt);
    }

    @Override public String unsign(String signedValue) {
        return unsign(signedValue, 0);
    }

    public String unsign(String signedValue, int maxAge) {
        String result = super.unsign(signedValue);
        String[] parts = result.split(SEPARATOR, 2);
        String value = parts[0];
        String timestamp = parts[1];
        // TODO: check maxAge
        return value;
    }
}
