import { History } from "src/entities/history.entity";
import { StatusType } from "src/entities/status_type";

export function formatTweet(history: History): string {
  const title = history.record.title
  const status = formatStatusText(history)
  const url = `https://animeta.net/-${history.id}`
  const comment = history.contains_spoiler ?
    `[🔇 내용 누설 가림]`
    : history.comment
  let s = `${title} ${status}`
  if (comment !== '')
    s += `: ${comment}`
  const limit = 140 - (url.length + 1)
  if (s.length > limit) {
    s = s.substring(0, limit - 1)
    s += '\u2026'
  }
  s += ` ${url}`
  return s
}

const STATUS_TYPE_TEXT: {[P in keyof typeof StatusType]: string} = {
  WATCHING: '보는 중',
  FINISHED: '완료',
  INTERESTED: '볼 예정',
  SUSPENDED: '중단',
};

function formatStatusText(history: History): string {
  let status = history.status.trim()
  if (status !== '' && /[0-9]$/.test(status)) {
    status += '화'
  }
  if (history.status_type !== StatusType.WATCHING || status === '') {
    const statusTypeText = STATUS_TYPE_TEXT[history.status_type]
    if (status !== '') {
      status += ` (${statusTypeText})`
    } else {
      status = statusTypeText
    }
  }
  return status
}
