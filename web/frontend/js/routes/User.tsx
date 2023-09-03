import { RouteComponentProps } from '../routes';
import React from 'react';
import Library from '../ui/Library';
import { UserRouteDocument, UserRouteQuery } from './__generated__/User.graphql';
import { NormalizedUserRouteQuery, normalizeUserRouteQuery } from '../UserRouteUtils';
import { UserLayout } from '../layouts/UserLayout';

type UserRouteData = UserRouteQuery & {
  user: NonNullable<UserRouteQuery['user']>;
  query: NormalizedUserRouteQuery;
};

function UserRoute({ data, controller }: RouteComponentProps<UserRouteData>) {
  const { query, user } = data;

  function addRecord() {
    const basePath = `/users/${encodeURIComponent(user.name!)}/`;
    controller!.load({ path: basePath, query: {} });
  }

  return (
    <Library
      query={query}
      onAddRecord={addRecord}
      user={user}
    />
  );
}

export default UserLayout.wrap({
  component: UserRoute,

  async load({ loader, params, query }) {
    const { username } = params;
    const normalizedQuery = normalizeUserRouteQuery(query);
    const data = await loader.graphql(UserRouteDocument, {
      username,
      statusTypeFilter: normalizedQuery.statusType,
      categoryIdFilter: normalizedQuery.categoryId,
      recordOrder: normalizedQuery.orderBy,
    });
    const user = data.user;
    if (!user) {
      // TODO: 404
    }
    return {
      ...data,
      user: user!,
      query: normalizedQuery,
    };
  },
});
