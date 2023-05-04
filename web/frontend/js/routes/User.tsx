import { RouteComponentProps, RouteHandler } from '../routes';
import React from 'react';
import { GqlUser as UserLayout } from '../layouts';
import { RecordDTO } from '../../../shared/types';
import Library from '../ui/Library';
import { UserRouteDocument, UserRouteQuery } from './__generated__/User.graphql';
import { NormalizedUserRouteQuery, normalizeUserRouteQuery } from '../UserRouteUtils';
import { UserLayoutPropsData } from '../ui/GqlUserLayout';

type UserRouteData = UserLayoutPropsData & UserRouteQuery & {
  query: NormalizedUserRouteQuery;
  records: RecordDTO[];
};

function User({ data, controller }: RouteComponentProps<UserRouteData>) {
  const { query, records, user } = data;

  function addRecord() {
    const basePath = `/users/${encodeURIComponent(user.name!)}/`;
    controller!.load({ path: basePath, query: {} });
  }

  return (
    <Library
      query={query}
      records={records}
      onAddRecord={addRecord}
      gqlUser={user}
    />
  );
}

const routeHandler: RouteHandler<UserRouteData> = {
  component: UserLayout(User),

  async load({ loader, params, query }) {
    const { username } = params;
    const { type, category, sort } = query;
    const normalizedQuery = normalizeUserRouteQuery(query);
    const [records, data] = await Promise.all([
      loader.callV4<RecordDTO[]>(`/users/${encodeURIComponent(username)}/records`, {
        sort,
        status_type: type,
        category_id: category,
        options: {
          hasNewerEpisode: true,
        },
      }),
      loader.graphql(UserRouteDocument, {
        username,
        statusTypeFilter: normalizedQuery.statusType,
        categoryIdFilter: normalizedQuery.categoryId,
      })
    ]);
    const user = data.user;
    if (!user) {
      // TODO: 404
    }
    return {
      records,
      query: normalizedQuery,
      ...data,
      user: user!,
    };
  },

  renderTitle({ user }) {
    return `${user.name!} 사용자`;
  },
};
export default routeHandler;
