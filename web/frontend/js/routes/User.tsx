import { RouteComponentProps, RouteHandler } from '../routes';
import React from 'react';
import { User as UserLayout } from '../layouts';
import { RecordDTO, UserDTO } from '../../../shared/types';
import Library from '../ui/Library';
import { UserRouteDocument, UserRouteQuery } from './__generated__/User.graphql';
import { NormalizedUserRouteQuery, normalizeUserRouteQuery } from '../UserRouteUtils';
import { UserLayoutPropsData } from '../ui/UserLayout';

type UserRouteData = UserLayoutPropsData & UserRouteQuery & {
  currentUser: UserDTO | null;
  user: UserDTO;
  query: NormalizedUserRouteQuery;
  records: RecordDTO[];
};

function User({ data, controller }: RouteComponentProps<UserRouteData>) {
  const { currentUser, user, query, records, gqlUser } = data;
  const canEdit = currentUser ? currentUser.id === user.id : false;

  function addRecord() {
    const basePath = `/users/${encodeURIComponent(user.name)}/`;
    controller!.load({ path: basePath, query: {} });
  }

  return (
    <Library
      query={query}
      records={records}
      canEdit={canEdit}
      onAddRecord={addRecord}
      gqlUser={gqlUser!}
    />
  );
}

const routeHandler: RouteHandler<UserRouteData> = {
  component: UserLayout(User),

  async load({ loader, params, query }) {
    const { username } = params;
    const { type, category, sort } = query;
    const normalizedQuery = normalizeUserRouteQuery(query);
    const [currentUser, user, records, data] = await Promise.all([
      loader.getCurrentUser({
        options: {},
      }),
      loader.callV4<UserDTO>(`/users/${encodeURIComponent(username)}`, {
        options: {
          stats: true,
        },
      }),
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
    return {
      currentUser,
      user,
      records,
      query: normalizedQuery,
      ...data,
    };
  },

  renderTitle({ user }) {
    return `${user.name} 사용자`;
  },
};
export default routeHandler;
