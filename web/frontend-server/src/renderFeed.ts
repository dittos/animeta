function getStatusDisplay(record: any) {
  return record.status.trim().replace(/([0-9]+)$/, '$1화');
}

const STATUS_TYPE_TEXT: {[key: string]: string} = {
  WATCHING: '보는 중',
  FINISHED: '완료',
  INTERESTED: '볼 예정',
  SUSPENDED: '중단',
};

function getStatusText(record: any) {
  var status = getStatusDisplay(record);
  if (record.statusType !== 'WATCHING' || status === '') {
    var statusTypeText = STATUS_TYPE_TEXT[record.statusType];
    if (status !== '') {
      status += ' (' + statusTypeText + ')';
    } else {
      status = statusTypeText;
    }
  }
  return status;
}

export default (owner: any, posts: any[]) =>
  `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
    <title>${owner.name} 사용자의 감상 기록</title>
    <link href="https://animeta.net/users/${owner.name}/" />
    <updated>${posts[0] &&
      new Date(posts[0].updatedAt).toISOString()}</updated>
    <id>animeta-${owner.name}</id>
${posts
    .map(
      post => `
    <entry>
        <id>tag:animeta.net,${
          new Date(post.updatedAt).toISOString().split('T')[0]
        }:${post.id}</id>
        <link href="https://animeta.net/-${post.id}" />
        <title>${post.title} ${getStatusText(post)}</title>
        <updated>${new Date(post.updatedAt).toISOString()}</updated>
        ${post.comment && `<summary>${post.comment}</summary>`}
    </entry>`
    )
    .join('')}
</feed>`;
