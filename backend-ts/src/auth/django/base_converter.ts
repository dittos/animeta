const DECIMAL_DIGITS = "0123456789"

export class BaseConverter {
  static BASE62 = new BaseConverter("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz")

  constructor(private digits: string, private sign: string = '-') {
    if (digits.indexOf(sign) !== -1) {
      throw new Error("Sign character found in converter base digits.")
    }
  }

  public encode(number: number): string {
    const s = number.toFixed(0)

    const neg = s.charAt(0) == '-'

    let x = 0
    for (var i = neg ? 1 : 0; i < s.length; i++) {
      const index = DECIMAL_DIGITS.indexOf(s.charAt(i))
      if (index === -1) {
        throw new Error()
      }
      x = (x * DECIMAL_DIGITS.length) + index
    }

    let res: string;
    if (x == 0) {
      res = "" + this.digits[0]
    } else {
      res = "";
      while (x > 0) {
        const digit = x % this.digits.length
        res = this.digits[digit] + res
        x = Math.floor(x / this.digits.length)
      }
    }

    if (neg) {
      return "-" + res
    } else {
      return res
    }
  }

  public decode(s: string): number {
    const neg = s.charAt(0) === this.sign

    let x = 0
    for (var i = neg ? 1 : 0; i < s.length; i++) {
      const index = this.digits.indexOf(s.charAt(i));
      if (index == -1) {
        throw new Error()
      }
      x = (x * this.digits.length) + index
    }

    if (neg) {
      return x * -1
    } else {
      return x
    }
  }
}
