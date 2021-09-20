export class Period {
  constructor(
    public readonly year: number,
    public readonly quarter: number
  ) {}

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

  static parse(s: string): Period | null {
    const match = s.match(/([0-9]{4})Q([1-4])/)
    if (!match) {
      return null
    }
    return new Period(Number(match[1]), Number(match[2]))
  }
}
