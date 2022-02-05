import { RouteComponentProps, RouteHandler } from '../routes';
import React from 'react';
import { User as UserLayout } from '../layouts';
import { RecordDTO, UserDTO } from '../../../shared/types';
import Library, { LibraryRouteQuery } from '../ui/Library';

type RecordsResult = {
  data: RecordDTO[];
  counts: {
    total: number;
    filtered: number;
    by_status_type: {[key: string]: number} & {_all: number};
    by_category_id: {[key: string]: number} & {_all: number};
  };
};

type UserRouteData = {
  currentUser: UserDTO | null;
  user: UserDTO;
  query: LibraryRouteQuery;
  records: RecordsResult;
};

function User({ data, controller }: RouteComponentProps<UserRouteData>) {
  const { currentUser, user, query, records } = data;
  const canEdit = currentUser ? currentUser.id === user.id : false;

  function addRecord() {
    const basePath = `/users/${encodeURIComponent(user.name)}/`;
    controller!.load({ path: basePath, query: {} });
  }

  return (
    <Library
      user={user}
      count={records.counts.total}
      query={query}
      records={records.data}
      filteredCount={records.counts.filtered}
      categoryStats={records.counts.by_category_id}
      categoryList={user.categories!}
      statusTypeStats={records.counts.by_status_type}
      canEdit={canEdit}
      onAddRecord={addRecord}
    />
  );
}

const routeHandler: RouteHandler<UserRouteData> = {
  component: UserLayout(User),

  async load({ loader, params, query }) {
    const { username } = params;
    const { type, category, sort } = query;
    const [currentUser, user, records] = await Promise.all([
      loader.getCurrentUser({
        options: {},
      }),
      loader.callV4<UserDTO>(`/users/${encodeURIComponent(username)}`, {
        options: {
          stats: true,
          categories: true,
        },
      }),
      loader.call<RecordsResult>(`/users/${encodeURIComponent(username)}/records`, {
        sort,
        status_type: type,
        category_id: category,
        with_counts: true,
        options: {
          hasNewerEpisode: true,
        },
      }),
    ]);
    return {
      currentUser,
      user,
      records,
      query,
    };
  },

  renderTitle({ user }) {
    return `${user.name} 사용자`;
  },
};
export default routeHandler;
