import { RouteComponentProps } from './routes';
import React from 'react';
import { UserDTO } from '../../shared/types';
import { GlobalHeader, GlobalHeaderProps } from './ui/GlobalHeader';
import UserLayout, { UserLayoutProps, UserLayoutPropsData } from './ui/UserLayout';
import * as Sentry from '@sentry/react';

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

export function App<Props extends { data: { currentUser: UserDTO | null } }>(
  Component: React.JSXElementConstructor<Props>,
  globalHeaderProps?: Partial<GlobalHeaderProps>
) {
  return (props: Props) => (
    <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
      <GlobalHeader
        currentUsername={props.data.currentUser?.name}
        {...globalHeaderProps}
      />
      <Component {...props} />
    </Sentry.ErrorBoundary>
  );
}

export function User<Data extends UserLayoutPropsData>(
  Component: React.JSXElementConstructor<RouteComponentProps<Data>>,
  layoutProps: Partial<UserLayoutProps> = {},
  globalHeaderProps: Partial<GlobalHeaderProps> = {}
) {
  return (props: RouteComponentProps<Data>) => (
    <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
      <GlobalHeader
        currentUsername={props.data.currentUser?.name}
        activeMenu={
          props.data.user.isCurrentUser
            ? 'user'
            : null
        }
        {...globalHeaderProps}
      />
      <UserLayout {...props} {...layoutProps}>
        <Component {...props} />
      </UserLayout>
    </Sentry.ErrorBoundary>
  );
}

export interface StackablePropsData {
  stacked?: boolean;
}

export function Stackable<D extends StackablePropsData>(
  layout: (c: React.JSXElementConstructor<RouteComponentProps<D>>) => React.JSXElementConstructor<RouteComponentProps<D>>,
  Content: React.JSXElementConstructor<RouteComponentProps<D>>
) {
  const Wrapped = layout(Content);
  return (props: RouteComponentProps<D>) => {
    const Component = props.data.stacked ? Content : Wrapped;
    return <Component {...props} />;
  };
}
