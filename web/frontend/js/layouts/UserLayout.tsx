import React from 'react';
import { GlobalHeader, GlobalHeaderProps } from '../ui/GlobalHeader';
import { Request } from 'nuri/app';
import { Loader } from '../../../shared/loader';
import { ErrorBoundary } from './ErrorBoundary';
import { UserLayoutDocument } from './__generated__/UserLayout.graphql';
import UserLayoutComponent, { UserLayoutProps, UserLayoutPropsData } from '../ui/UserLayout';
import { createLayout } from '../LayoutWrapper';

export function UserLayout(
  layoutProps: Partial<UserLayoutProps> = {},
  globalHeaderProps: Partial<GlobalHeaderProps> = {}
) {
  return createLayout({
    component: (props: {
      layoutData: UserLayoutPropsData,
      children: React.ReactNode
    }) => (
      <ErrorBoundary>
        <GlobalHeader
          currentUsername={props.layoutData.currentUser?.name}
          activeMenu={
            props.layoutData.user.isCurrentUser
              ? 'user'
              : null
          }
          {...globalHeaderProps}
        />
        <UserLayoutComponent data={props.layoutData} {...layoutProps}>
          {props.children}
        </UserLayoutComponent>
      </ErrorBoundary>
    ),
    load: async (request: Request<Loader>) => {
      const {user, ...layoutData} = await request.loader.graphql(UserLayoutDocument, {username: request.params['username']})
      if (!user) {
        return request.notFound();
      }
      return {...layoutData, user}
    },
    renderTitle: ({ user }) => {
      return `${user.name} 사용자`;
    }
  })
}

UserLayout.wrap = UserLayout().wrap
