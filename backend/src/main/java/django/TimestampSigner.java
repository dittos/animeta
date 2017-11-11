package django;

import javax.annotation.Nullable;
import java.time.Duration;
import java.time.Instant;

public class TimestampSigner extends Signer {
    public TimestampSigner(String key, String salt) {
        super(key, salt);
    }

    @Override public String unsign(String signedValue) {
        return unsign(signedValue, null);
    }

    public String unsign(String signedValue, @Nullable Duration maxAge) {
        String result = super.unsign(signedValue);
        String[] parts = result.split(SEPARATOR, 2);
        String value = parts[0];
        Instant timestamp = Instant.ofEpochSecond(BaseConverter.BASE62.decode(parts[1]));
        if (maxAge != null) {
            // Check timestamp is not older than max_age
            Instant expiry = timestamp.plus(maxAge);
            if (Instant.now().isAfter(expiry)) {
                throw new SignatureExpired("signature expired");
            }
        }
        return value;
    }
}
