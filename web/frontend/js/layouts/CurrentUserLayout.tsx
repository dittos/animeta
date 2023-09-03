import React from 'react';
import { GlobalHeader, GlobalHeaderProps } from '../ui/GlobalHeader';
import { Request } from 'nuri/app';
import { Loader } from '../../../shared/loader';
import { ErrorBoundary } from './ErrorBoundary';
import { CurrentUserLayoutDocument } from './__generated__/CurrentUserLayout.graphql';
import UserLayoutComponent, { UserLayoutProps, UserLayoutPropsData } from '../ui/UserLayout';
import { createLayout } from '../LayoutWrapper';

export function CurrentUserLayout(
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
    load: async (request: Request<Loader>): Promise<UserLayoutPropsData> => {
      const {currentUser, user, ...layoutData} = await request.loader.graphql(CurrentUserLayoutDocument)
      if (!currentUser || !user) {
        // TODO: throw not found
      }
      return {...layoutData, currentUser: currentUser!, user: user!}
    },
    renderTitle: ({ user }) => {
      return `${user.name} 사용자`;
    }
  })
}

CurrentUserLayout.wrap = CurrentUserLayout().wrap
