import _ from 'lodash';
import React from 'react';
import {User as UserLayout} from '../layouts';
import Library from '../ui/Library';
import '../../less/library.less';

function getCount(records) {
    return _.size(records);
}

function getCategoryStats(records) {
    return _.countBy(records, record => record.category_id || 0);
}

function getStatusTypeStats(records) {
    return _.countBy(records, 'status_type');
}

function filterAndSort(records, statusType, categoryId, sortBy) {
    var chain = _(records);
    if (statusType) {
        chain = chain.filter(record => record.status_type == statusType);
    }
    if (categoryId === 0 || categoryId) {
        chain = chain.filter(record => (record.category_id || 0) == categoryId);
    }
    chain = chain.values();
    if (sortBy == 'date') {
        chain = chain.sortBy('created_at').reverse();
    } else if (sortBy == 'title') {
        chain = chain.sortBy('title');
    }
    return chain.value();
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
