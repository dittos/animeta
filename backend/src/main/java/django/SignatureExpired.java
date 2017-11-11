package django;

public class SignatureExpired extends RuntimeException {
    public SignatureExpired(String message) {
        super(message);
    }
}
