import size from 'lodash/size';
import countBy from 'lodash/countBy';
import filter from 'lodash/filter';
import sort from 'lodash/sortBy';
import React from 'react';
import {User as UserLayout} from '../layouts';
import Library from '../ui/Library';
import '../../less/library.less';

function getCount(records) {
    return size(records);
}

function getCategoryStats(records) {
    return countBy(records, record => record.category_id || 0);
}

function getStatusTypeStats(records) {
    return countBy(records, 'status_type');
}

function filterAndSort(records, statusType, categoryId, sortBy) {
    if (statusType) {
        records = filter(records, record => record.status_type == statusType);
    }
    if (categoryId === 0 || categoryId) {
        records = filter(records, record => (record.category_id || 0) == categoryId);
    }
    if (sortBy == 'date') {
        records = sort(records, 'created_at').reverse();
    } else if (sortBy == 'title') {
        records = sort(records, 'title');
    }
    return records;
}

class User extends React.Component {
    constructor(props, context) {
        super(props, context);
        const records = {};
        props.data.records.forEach(record => {
            records[record.id] = record;
        });
        this.state = {
            records,
        };
    }

    render() {
        const {
            currentUser,
            user,
            query,
        } = this.props.data;
        const {records} = this.state;
        const canEdit = currentUser && currentUser.id === user.id;
        var {type, category, sort} = query;
        if (!sort) sort = 'date';
        return <Library
            user={user}
            count={getCount(records)}
            query={query}
            records={filterAndSort(records, type, category, sort)}
            categoryStats={getCategoryStats(records)}
            categoryList={user.categories}
            statusTypeStats={getStatusTypeStats(records)}
            canEdit={canEdit}
        />;
    }
}

export default {
    component: UserLayout(User),
    
    async load({ loader, params, query }) {
        const {username} = params;
        const [currentUser, user, records] = await Promise.all([
            loader.getCurrentUser(),
            loader.call(`/users/${encodeURIComponent(username)}`),
            loader.call(`/users/${encodeURIComponent(username)}/records`, {
                include_has_newer_episode: JSON.stringify(true),
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
    }
};
