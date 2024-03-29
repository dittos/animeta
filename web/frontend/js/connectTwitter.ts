declare global {
  interface Window {
    onTwitterConnect: ((ok: boolean) => void) | null;
  }
}

var _twitterConnectPromise: Promise<void> | null = null;

export default function connectTwitter() {
  if (!_twitterConnectPromise) {
    _twitterConnectPromise = new Promise((resolve, reject) => {
      window.onTwitterConnect = ok => {
        try {
          if (ok) {
            resolve();
          } else {
            alert('연동 실패. 잠시 후 다시 시도해주세요.');
            reject();
          }
        } finally {
          window.onTwitterConnect = null;
          _twitterConnectPromise = null;
        }
      };
      window.open('/api/v4/me/external-services/twitter/connect');
    });
  }
  return _twitterConnectPromise;
}
