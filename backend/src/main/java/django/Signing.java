package django;

import com.google.common.io.BaseEncoding;
import okio.Buffer;
import okio.DeflaterSink;
import okio.InflaterSource;

import javax.annotation.Nullable;
import java.io.IOException;
import java.time.Duration;
import java.util.zip.Deflater;
import java.util.zip.Inflater;

public class Signing {
    static final BaseEncoding BASE64 = BaseEncoding.base64Url().omitPadding();

    public static <T> T loadString(String s, String key, String salt, Serializer<T> serializer, @Nullable Duration maxAge) throws IOException {
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

    public static <T> String toString(T obj, String key, String salt, Serializer<T> serializer, boolean compress) throws IOException {
        byte[] data = serializer.serialize(obj);
        boolean isCompressed = false;
        if (compress) {
            byte[] compressed = compress(data);
            if (compressed.length < data.length - 1) {
                data = compressed;
                isCompressed = true;
            }
        }
        String base64d = BaseEncoding.base64Url().omitPadding().encode(data);
        if (isCompressed) {
            base64d = "." + base64d;
        }
        return new TimestampSigner(key, salt).sign(base64d);
    }

    private static byte[] decompress(byte[] compressed) throws IOException {
        Buffer buffer = new Buffer().write(compressed);
        Inflater inflater = new Inflater();
        Buffer decompressed = new Buffer();
        decompressed.writeAll(new InflaterSource(buffer, inflater));
        return decompressed.readByteArray();
    }

    private static byte[] compress(byte[] data) throws IOException {
        Buffer buffer = new Buffer().write(data);
        Deflater deflater = new Deflater();
        Buffer compressed = new Buffer();
        DeflaterSink sink = new DeflaterSink(compressed, deflater);
        buffer.readAll(sink);
        sink.close();
        return compressed.readByteArray();
    }

    public interface Serializer<T> {
        byte[] serialize(T obj) throws IOException;
        T deserialize(byte[] data) throws IOException;
    }
}
