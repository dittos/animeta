import { SourceType, StatusType } from "./__generated__/globalTypes";

interface GqlHasStatus {
  statusType?: StatusType | null
  status?: string | null
}

export function zerofill(n: number): string {
  let s = String(n);
  if (s.length == 1) s = '0' + s;
  return s;
}

export function getTime(date: Date): string {
  return zerofill(date.getHours()) + ':' + zerofill(date.getMinutes());
}

const HOURS: string[] = [];
for (var h = 0; h < 24; h++) {
  var result;
  if (h < 12) result = '오전 ' + h + '시';
  else if (h == 12) result = '정오';
  else result = '오후 ' + (h - 12) + '시';
  HOURS[h] = result;
}

let TIME_FORMAT: Intl.DateTimeFormat | null = null;
try {
  TIME_FORMAT = new Intl.DateTimeFormat('ko-u-hc-h11', {
    hour: 'numeric', minute: 'numeric',
    timeZone: 'Asia/Seoul'
  });
} catch (e) {}

export function formatTime(value: Date): string {
  if (TIME_FORMAT) {
    return TIME_FORMAT.format(value);
  }
  var result = HOURS[value.getHours()];
  var m = value.getMinutes();
  if (m > 0) {
    result += ' ' + zerofill(m) + '분';
  }
  return result;
}

export function plusOne(val: string): string {
  var matches = val.match(/(\d+)[^\d]*$/);
  if (!matches) return val;
  var add1 = (parseInt(matches[1], 10) + 1).toString();
  var digits = matches[1].length;
  if (add1.length < digits)
    for (var i = 0; i < digits - add1.length; i++) add1 = '0' + add1;
  return val.replace(/(\d+)([^\d]*)$/, add1 + '$2');
}

export function getStatusDisplayGql(record: GqlHasStatus): string {
  return formatStatus(record.status ?? '');
}

export function formatStatus(status: string | number): string {
  return `${status}`.trim().replace(/([0-9]+)$/, '$1화');
}

export const STATUS_TYPE_TEXT = {
  watching: '보는 중',
  finished: '완료',
  interested: '볼 예정',
  suspended: '중단',
};

export const GQL_STATUS_TYPE_TEXT: {[K in StatusType]: string} = {
  WATCHING: '보는 중',
  FINISHED: '완료',
  INTERESTED: '볼 예정',
  SUSPENDED: '중단',
};

export function getStatusTextGql(record: GqlHasStatus): string {
  var status = getStatusDisplayGql(record);
  if (record.statusType !== 'WATCHING' || status === '') {
    var statusTypeText = GQL_STATUS_TYPE_TEXT[record.statusType!];
    if (status !== '') {
      status += ' (' + statusTypeText + ')';
    } else {
      status = statusTypeText;
    }
  }
  return status;
}

export function getWorkURL(title: string): string {
  return '/works/' + encodeURIComponent(title) + '/';
}

export function getPostURLGql(post: { databaseId: string } | { id: string }): string {
  return '/-' + ('databaseId' in post ? post.databaseId : post.id);
}

export const SOURCE_TYPE_MAP: {[K in SourceType]: string} = {
  MANGA: '만화 원작',
  ORIGINAL: '오리지널 작품',
  LIGHT_NOVEL: '라노베 원작',
  GAME: '게임 원작',
  FOUR_KOMA: '4컷 만화 원작',
  VISUAL_NOVEL: '비주얼 노벨 원작',
  NOVEL: '소설 원작',
};

export function formatPeriod(period: {year: number; month: number}): string {
  return `${period.year}년 ${period.month}월`
}
