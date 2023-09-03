import { RouteComponentProps } from './routes';
import React from 'react';
import { UserDTO } from '../../shared/types';
import { GlobalHeader, GlobalHeaderProps } from './ui/GlobalHeader';
import UserLayout, { UserLayoutProps, UserLayoutPropsData } from './ui/UserLayout';
import { ErrorBoundary } from './layouts/ErrorBoundary';

export function App<Props extends { data: { currentUser: UserDTO | null } }>(
  Component: React.JSXElementConstructor<Props>,
  globalHeaderProps?: Partial<GlobalHeaderProps>
) {
  return (props: Props) => (
    <ErrorBoundary>
      <GlobalHeader
        currentUsername={props.data.currentUser?.name}
        {...globalHeaderProps}
      />
      <Component {...props} />
    </ErrorBoundary>
  );
}

export function User<Data extends UserLayoutPropsData>(
  Component: React.JSXElementConstructor<RouteComponentProps<Data>>,
  layoutProps: Partial<UserLayoutProps> = {},
  globalHeaderProps: Partial<GlobalHeaderProps> = {}
) {
  return (props: RouteComponentProps<Data>) => (
    <ErrorBoundary>
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
    </ErrorBoundary>
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
