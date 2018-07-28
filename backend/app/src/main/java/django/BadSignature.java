package django;

public class BadSignature extends RuntimeException {
    public BadSignature(String message) {
        super(message);
    }
}
