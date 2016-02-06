import {getStatusText} from '../js/util';

export default (owner, posts) => (
    `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
    <title>${owner.name} 사용자의 감상 기록</title>
    <link href="https://animeta.net/users/${owner.name}/" />
    <updated>${posts[0] && new Date(posts[0].updated_at).toISOString()}</updated>
    <id>animeta-${owner.name}</id>
${posts.map(post => `
    <entry>
        <id>tag:animeta.net,${new Date(post.updated_at).toISOString().split('T')[0]}:${post.id}</id>
        <link href="https://animeta.net/-${post.id}" />
        <title>${post.record.title} ${getStatusText(post)}</title>
        <updated>${new Date(post.updated_at).toISOString()}</updated>
        ${post.comment && `<summary>${post.comment}</summary>`}
    </entry>`).join()}
</feed>`
)
