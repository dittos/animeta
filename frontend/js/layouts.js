/* global Raven */
import React from 'react';
import GlobalHeader from './ui/GlobalHeader';
import UserLayout from './ui/UserLayout';

class ErrorHandler extends React.Component {
  state = {
    error: null,
  };

  render() {
    if (this.state.error) {
      return (
        <React.Fragment>
          <h1>오류가 발생했습니다.</h1>
          <p>페이지 새로 고침 후 다시 시도해보세요.</p>
          <p>
            발생한 오류는 관리자에게 전송되었으며, 문제가 계속 발생한다면{' '}
            <a href="/support/">버그 신고</a> 부탁드립니다.
          </p>
        </React.Fragment>
      );
    }
    return this.props.children;
  }

  componentDidCatch(error, info) {
    this.setState({ error });
    Raven.captureException(error, { extra: info });
  }
}

export function App(Component, globalHeaderProps) {
  return props => (
    <ErrorHandler>
      <GlobalHeader
        currentUser={props.data.currentUser}
        {...globalHeaderProps}
      />
      <Component {...props} />
    </ErrorHandler>
  );
}

export function User(Component) {
  return props => (
    <ErrorHandler>
      <GlobalHeader
        currentUser={props.data.currentUser}
        activeMenu={
          props.data.currentUser &&
          props.data.currentUser.id === props.data.user.id
            ? 'user'
            : null
        }
      />
      <UserLayout {...props}>
        <Component {...props} />
      </UserLayout>
    </ErrorHandler>
  );
}
