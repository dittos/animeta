/* global Raven */
import { RouteComponentProps } from 'nuri/app';
import React, { ErrorInfo } from 'react';
import { UserDTO } from './types_generated';
import { GlobalHeader, GlobalHeaderProps } from './ui/GlobalHeader';
import UserLayout, { UserLayoutProps, UserLayoutPropsData } from './ui/UserLayout';

class ErrorHandler extends React.Component {
  state = {
    error: null,
  };

  render() {
    if (this.state.error) {
      return (
        <>
          <h1>오류가 발생했습니다.</h1>
          <p>페이지 새로 고침 후 다시 시도해보세요.</p>
          <p>
            발생한 오류는 관리자에게 전송되었으며, 문제가 계속 발생한다면{' '}
            <a href="/support/">버그 신고</a> 부탁드립니다.
          </p>
        </>
      );
    }
    return this.props.children;
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.setState({ error });
    (window as any).Raven.captureException(error, { extra: info });
  }
}

export function App<Props extends { data: { currentUser?: UserDTO } }>(
  Component: React.JSXElementConstructor<Props>,
  globalHeaderProps: Partial<GlobalHeaderProps>
) {
  return (props: Props) => (
    <ErrorHandler>
      <GlobalHeader
        currentUser={props.data.currentUser}
        {...globalHeaderProps}
      />
      <Component {...props} />
    </ErrorHandler>
  );
}

export function User<Data extends UserLayoutPropsData>(
  Component: React.JSXElementConstructor<RouteComponentProps<Data>>,
  layoutProps: Partial<UserLayoutProps> = {},
  globalHeaderProps: Partial<GlobalHeaderProps> = {}
) {
  return (props: RouteComponentProps<Data>) => (
    <ErrorHandler>
      <GlobalHeader
        currentUser={props.data.currentUser}
        activeMenu={
          props.data.currentUser &&
          props.data.currentUser.id === props.data.user.id
            ? 'user'
            : null
        }
        {...globalHeaderProps}
      />
      <UserLayout {...props} {...layoutProps}>
        <Component {...props} />
      </UserLayout>
    </ErrorHandler>
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
