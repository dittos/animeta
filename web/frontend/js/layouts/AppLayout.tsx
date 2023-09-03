import React from 'react';
import { GlobalHeader, GlobalHeaderProps } from '../ui/GlobalHeader';
import { Request } from 'nuri/app';
import { Loader } from '../../../shared/loader';
import { AppLayoutDocument, AppLayoutQuery } from './__generated__/AppLayout.graphql';
import { ErrorBoundary } from './ErrorBoundary';
import { createLayout } from '../LayoutWrapper';

export function AppLayout(
  globalHeaderProps?: Partial<GlobalHeaderProps>
) {
  return createLayout({
    component: (props: {
      layoutData: AppLayoutQuery,
      children: React.ReactNode
    }) => (
      <ErrorBoundary>
        <GlobalHeader
          currentUsername={props.layoutData.currentUser?.name}
          {...globalHeaderProps}
        />
        {props.children}
      </ErrorBoundary>
    ),
    load: (request: Request<Loader>) =>
      request.loader.graphql(AppLayoutDocument)
  })
}

AppLayout.wrap = AppLayout().wrap
