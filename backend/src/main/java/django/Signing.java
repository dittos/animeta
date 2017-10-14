package django;

import java.io.IOException;
import java.util.zip.Inflater;

import com.google.common.io.BaseEncoding;
import okio.Buffer;
import okio.InflaterSource;

public class Signing {
    static final BaseEncoding BASE64 = BaseEncoding.base64Url().omitPadding();

    public static <T> T loadString(String s, String key, String salt, Serializer<T> serializer, int maxAge) throws IOException {
        String base64d = new TimestampSigner(key, salt).unsign(s, maxAge);
        boolean decompress = false;
        if (base64d.startsWith(".")) {
            base64d = base64d.substring(1);
            decompress = true;
        }
        byte[] data = BASE64.decode(base64d);
        if (decompress) {
            data = decompress(data);
        }
        return serializer.deserialize(data);
    }

    private static byte[] decompress(byte[] compressed) throws IOException {
        Buffer buffer = new Buffer().write(compressed);
        Inflater inflater = new Inflater();
        Buffer decompressed = new Buffer();
        decompressed.writeAll(new InflaterSource(buffer, inflater));
        return decompressed.readByteArray();
    }

    public interface Serializer<T> {
        T deserialize(byte[] data) throws IOException;
    }
}
