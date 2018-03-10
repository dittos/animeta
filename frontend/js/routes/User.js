import React from 'react';
import { User as UserLayout } from '../layouts';
import Library from '../ui/Library';

class User extends React.Component {
  render() {
    const { currentUser, user, query, records } = this.props.data;
    const canEdit = currentUser && currentUser.id === user.id;
    return (
      <Library
        user={user}
        count={records.counts.total}
        query={query}
        records={records.data}
        filteredCount={records.counts.filtered}
        categoryStats={records.counts.by_category_id}
        categoryList={user.categories}
        statusTypeStats={records.counts.by_status_type}
        canEdit={canEdit}
        onAddRecord={this._addRecord}
      />
    );
  }

  _addRecord = () => {
    const basePath = `/users/${encodeURIComponent(this.props.data.user.name)}/`;
    this.props.controller.load({ path: basePath, query: {} });
  };
}

export default {
  component: UserLayout(User),

  async load({ loader, params, query }) {
    const { username } = params;
    const { type, category, sort } = query;
    const [currentUser, user, records] = await Promise.all([
      loader.getCurrentUser({
        options: {},
      }),
      loader.call(`/users/${encodeURIComponent(username)}`, {
        options: {
          stats: true,
          categories: true,
        },
      }),
      loader.call(`/users/${encodeURIComponent(username)}/records`, {
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
