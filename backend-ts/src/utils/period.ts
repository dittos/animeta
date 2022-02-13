import { Temporal } from "@js-temporal/polyfill";

export class Period {
  constructor(
    public readonly year: number,
    public readonly quarter: number
  ) {}

  next(): Period {
    if (this.quarter === 4) {
      return new Period(this.year + 1, 1)
    } else {
      return new Period(this.year, this.quarter + 1)
    }
  }

  getMonth() {
    switch (this.quarter) {
      case 1: return 1;
      case 2: return 4;
      case 3: return 7;
      case 4: return 10;
    }
  }

  toString() {
    return `${this.year}Q${this.quarter}`;
  }

  toFormattedString() {
    return `${this.year}년 ${this.getMonth()}월`;
  }

  equals(other: Period): boolean {
    return this.year === other.year && this.quarter === other.quarter;
  }

  compareTo(other: Period): number {
    if (this.year === other.year) {
      return this.quarter - other.quarter
    }
    return this.year - other.year
  }

  static parse(s: string): Period | null {
    const match = s.match(/([0-9]{4})Q([1-4])/)
    if (!match) {
      return null
    }
    return new Period(Number(match[1]), Number(match[2]))
  }

  static now(timeZone: Temporal.TimeZone | Temporal.TimeZoneProtocol): Period {
    const ym = Temporal.Now.plainDateISO(timeZone).toPlainYearMonth()
    return new Period(ym.year, ym.month / 4 + 1)
  }
}
