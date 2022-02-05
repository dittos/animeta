import { SundayStartWeekRange } from "./sunday_start_week_range"
import { Temporal } from '@js-temporal/polyfill';

describe('SundayStartWeekRange', () => {
  describe('static methods', () => {
    it('now', () => {
      const kst = Temporal.TimeZone.from('Asia/Seoul')
      const date = new Temporal.PlainDate(2022, 2, 10)
      jest.useFakeTimers('modern').setSystemTime(date.toZonedDateTime(kst).toInstant().epochMilliseconds)
      expect(SundayStartWeekRange.now(kst).equals(SundayStartWeekRange.including(date))).toBeTruthy()
    })

    it('including', () => {
      const expected = new SundayStartWeekRange(new Temporal.PlainDate(2022, 2, 6))
      expect(SundayStartWeekRange.including(new Temporal.PlainDate(2022, 2, 5)).equals(expected)).toBeFalsy()
      expect(SundayStartWeekRange.including(new Temporal.PlainDate(2022, 2, 6)).equals(expected)).toBeTruthy()
      expect(SundayStartWeekRange.including(new Temporal.PlainDate(2022, 2, 7)).equals(expected)).toBeTruthy()
      expect(SundayStartWeekRange.including(new Temporal.PlainDate(2022, 2, 8)).equals(expected)).toBeTruthy()
      expect(SundayStartWeekRange.including(new Temporal.PlainDate(2022, 2, 9)).equals(expected)).toBeTruthy()
      expect(SundayStartWeekRange.including(new Temporal.PlainDate(2022, 2, 10)).equals(expected)).toBeTruthy()
      expect(SundayStartWeekRange.including(new Temporal.PlainDate(2022, 2, 11)).equals(expected)).toBeTruthy()
      expect(SundayStartWeekRange.including(new Temporal.PlainDate(2022, 2, 12)).equals(expected)).toBeTruthy()
      expect(SundayStartWeekRange.including(new Temporal.PlainDate(2022, 2, 13)).equals(expected)).toBeFalsy()
    })
  })

  describe('instance methods', () => {
    it('equals', () => {
      const range1 = new SundayStartWeekRange(new Temporal.PlainDate(2022, 2, 6))
      const range2 = new SundayStartWeekRange(new Temporal.PlainDate(2022, 2, 6))
      const range3 = new SundayStartWeekRange(new Temporal.PlainDate(2022, 2, 13))
      expect(range1.equals(range1)).toBeTruthy()
      expect(range1.equals(range2)).toBeTruthy()
      expect(range1.equals(range3)).toBeFalsy()
    })

    it('prev', () => {
      const range = new SundayStartWeekRange(new Temporal.PlainDate(2022, 2, 6))
      expect(range.prev().equals(new SundayStartWeekRange(new Temporal.PlainDate(2022, 1, 30)))).toBeTruthy()
    })

    it('startDate, endDate', () => {
      const range = new SundayStartWeekRange(new Temporal.PlainDate(2022, 2, 6))
      expect(range.startDate().equals(new Temporal.PlainDate(2022, 2, 6))).toBeTruthy()
      expect(range.endDate().equals(new Temporal.PlainDate(2022, 2, 12))).toBeTruthy()
    })
  })
})