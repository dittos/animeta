package django;

import static com.google.common.primitives.Chars.indexOf;

public final class BaseConverter {
    public static final BaseConverter BASE62 = new BaseConverter("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".toCharArray());

    private static final char[] DECIMAL_DIGITS = "0123456789".toCharArray();
    private final char sign;
    private final char[] digits;

    public BaseConverter(char[] digits) {
        this(digits, '-');
    }

    public BaseConverter(char[] digits, char sign) {
        this.sign = sign;
        this.digits = digits;
        if (indexOf(digits, sign) != -1) {
            throw new IllegalArgumentException("Sign character found in converter base digits.");
        }
    }

    public String encode(long number) {
        String s = Long.toString(number);

        boolean neg = s.charAt(0) == '-';

        long x = 0L;
        for (int i = neg ? 1 : 0; i < s.length(); i++) {
            int index = indexOf(DECIMAL_DIGITS, s.charAt(i));
            if (index == -1) {
                throw new IllegalArgumentException();
            }
            x = Math.addExact(Math.multiplyExact(x, DECIMAL_DIGITS.length), index);
        }

        String res;
        if (x == 0) {
            res = "" + digits[0];
        } else {
            res = "";
            while (x > 0) {
                int digit = Math.toIntExact(x % digits.length);
                res = digits[digit] + res;
                x /= digits.length;
            }
        }

        if (neg) {
            return "-" + res;
        } else {
            return res;
        }
    }

    public long decode(String s) {
        boolean neg = s.charAt(0) == sign;

        long x = 0L;
        for (int i = neg ? 1 : 0; i < s.length(); i++) {
            int index = indexOf(digits, s.charAt(i));
            if (index == -1) {
                throw new IllegalArgumentException();
            }
            x = Math.addExact(Math.multiplyExact(x, digits.length), index);
        }

        if (neg) {
            return Math.multiplyExact(x, -1L);
        } else {
            return x;
        }
    }
}
