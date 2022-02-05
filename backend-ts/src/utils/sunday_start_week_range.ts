import { Temporal } from '@js-temporal/polyfill';

export class SundayStartWeekRange {
  constructor(public sunday: Temporal.PlainDate) {}

  equals(other: SundayStartWeekRange): boolean {
    return this.sunday.equals(other.sunday);
  }

  prev(): SundayStartWeekRange {
    return new SundayStartWeekRange(this.sunday.subtract({ weeks: 1 }))
  }

  startDate(): Temporal.PlainDate {
    return this.sunday
  }

  endDate(): Temporal.PlainDate {
    return this.sunday.add({ weeks: 1 }).subtract({ days: 1 })
  }

  static now(timeZone: Temporal.TimeZone | Temporal.TimeZoneProtocol): SundayStartWeekRange {
    return this.including(Temporal.Now.plainDateISO(timeZone))
  }

  static including(date: Temporal.PlainDate): SundayStartWeekRange {
    if (date.dayOfWeek === 7)
      return new SundayStartWeekRange(date)
    return new SundayStartWeekRange(date.subtract({ days: date.dayOfWeek }))
  }
}