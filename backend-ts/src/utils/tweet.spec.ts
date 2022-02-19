import { History } from "src/entities/history.entity"
import { Record } from "src/entities/record.entity"
import { StatusType } from "src/entities/status_type"
import { formatStatusText, formatTweet } from "./tweet"

describe('formatTweet', () => {
  test('simple', () => {
    const history = new History()
    history.id = 1
    history.record = new Record()
    history.record.title = '제목'
    history.comment = '내용'
    history.status = '1'
    history.status_type = StatusType.WATCHING
    expect(formatTweet(history)).toBe('제목 1화: 내용 https://animeta.net/-1')
  })

  test('spoiler', () => {
    const history = new History()
    history.id = 1
    history.record = new Record()
    history.record.title = '제목'
    history.comment = '내용'
    history.status = '1'
    history.status_type = StatusType.WATCHING
    history.contains_spoiler = true
    expect(formatTweet(history)).toBe('제목 1화: [🔇 내용 누설 가림] https://animeta.net/-1')
  })

  test('empty comment', () => {
    const history = new History()
    history.id = 1
    history.record = new Record()
    history.record.title = '제목'
    history.comment = ''
    history.status = '1'
    history.status_type = StatusType.WATCHING
    expect(formatTweet(history)).toBe('제목 1화 https://animeta.net/-1')
  })

  test('long comment', () => {
    const history = new History()
    history.id = 1
    history.record = new Record()
    history.record.title = '제목'
    history.comment = 'ㅋ'.repeat(140)
    history.status = '1'
    history.status_type = StatusType.WATCHING
    expect(formatTweet(history)).toBe(`제목 1화: ${'ㅋ'.repeat(109)}… https://animeta.net/-1`)
  })
})

describe('formatStatusText', () => {
  test('watching + numeric status', () => {
    const history = new History()
    history.status = '1'
    history.status_type = StatusType.WATCHING
    expect(formatStatusText(history)).toBe('1화')
  })
  test('watching + non-numeric status', () => {
    const history = new History()
    history.status = '1권'
    history.status_type = StatusType.WATCHING
    expect(formatStatusText(history)).toBe('1권')
  })
  test('watching + empty status', () => {
    const history = new History()
    history.status = ''
    history.status_type = StatusType.WATCHING
    expect(formatStatusText(history)).toBe('보는 중')
  })
  test('finished + numeric status', () => {
    const history = new History()
    history.status = '1'
    history.status_type = StatusType.FINISHED
    expect(formatStatusText(history)).toBe('1화 (완료)')
  })
  test('finished + non-numeric status', () => {
    const history = new History()
    history.status = '1권'
    history.status_type = StatusType.FINISHED
    expect(formatStatusText(history)).toBe('1권 (완료)')
  })
  test('finished + empty status', () => {
    const history = new History()
    history.status = ''
    history.status_type = StatusType.FINISHED
    expect(formatStatusText(history)).toBe('완료')
  })
})
