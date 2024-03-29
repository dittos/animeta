import React from 'react';
import * as Sentry from '@sentry/react';

export const ErrorBoundary: React.FC = ({ children }) => {
  return (
    <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
      {children}
    </Sentry.ErrorBoundary>
  );
}

function ErrorFallback() {
  return <>
    <h1>오류가 발생했습니다.</h1>
    <p>페이지 새로 고침 후 다시 시도해보세요.</p>
    <p>
      발생한 오류는 관리자에게 전송되었으며, 문제가 계속 발생한다면{' '}
      <a href="/support/">버그 신고</a> 부탁드립니다.
    </p>
  </>
}
