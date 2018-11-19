export function zerofill(n) {
  n = String(n);
  if (n.length == 1) n = '0' + n;
  return n;
}

export function getTime(date) {
  return zerofill(date.getHours()) + ':' + zerofill(date.getMinutes());
}

var HOURS = [];
for (var h = 0; h < 24; h++) {
  var result;
  if (h < 12) result = '오전 ' + h + '시';
  else if (h == 12) result = '정오';
  else result = '오후 ' + (h - 12) + '시';
  HOURS[h] = result;
}

export function formatTime(value) {
  var result = HOURS[value.getHours()];
  var m = value.getMinutes();
  if (m > 0) {
    result += ' ' + zerofill(m) + '분';
  }
  return result;
}

export function plusOne(val) {
  var matches = val.match(/(\d+)[^\d]*$/);
  if (!matches) return val;
  var add1 = (parseInt(matches[1], 10) + 1).toString();
  var digits = matches[1].length;
  if (add1.length < digits)
    for (var i = 0; i < digits - add1.length; i++) add1 = '0' + add1;
  return val.replace(/(\d+)([^\d]*)$/, add1 + '$2');
}

export function getStatusDisplay(record) {
  return record.status.trim().replace(/([0-9]+)$/, '$1화');
}

export var STATUS_TYPE_TEXT = {
  watching: '보는 중',
  finished: '완료',
  interested: '볼 예정',
  suspended: '중단',
};

export function getStatusText(record) {
  var status = getStatusDisplay(record);
  if (record.status_type != 'watching' || status === '') {
    var statusTypeText = STATUS_TYPE_TEXT[record.status_type];
    if (status !== '') {
      status += ' (' + statusTypeText + ')';
    } else {
      status = statusTypeText;
    }
  }
  return status;
}

export function getWorkURL(title) {
  return '/works/' + encodeURIComponent(title) + '/';
}

export function getPostURL(post) {
  return '/-' + post.id;
}

export function getPostDeleteURL(user, post) {
  return '/users/' + user.name + '/history/' + post.id + '/delete/';
}

export var SOURCE_TYPE_MAP = {
  manga: '만화 원작',
  original: '오리지널 작품',
  lightnovel: '라노베 원작',
  game: '게임 원작',
  '4koma': '4컷 만화 원작',
  visualnovel: '비주얼 노벨 원작',
  novel: '소설 원작',

  // V2
  MANGA: '만화 원작',
  ORIGINAL: '오리지널 작품',
  LIGHT_NOVEL: '라노베 원작',
  GAME: '게임 원작',
  FOUR_KOMA: '4컷 만화 원작',
  VISUAL_NOVEL: '비주얼 노벨 원작',
  NOVEL: '소설 원작',
};
