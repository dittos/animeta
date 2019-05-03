export function getLastPublishTwitter(): boolean {
  return window.localStorage.getItem('publishTwitter') === 'true';
}

export function setLastPublishTwitter(publishTwitter: boolean) {
  window.localStorage.setItem(
    'publishTwitter',
    publishTwitter ? 'true' : 'false'
  );
}
