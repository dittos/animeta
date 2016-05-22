import React from 'react';
import {Link} from '../Isomorphic';
import Layout from '../ui/Layout';
import Library from '../ui/Library';
import RecordStore from '../store/RecordStore';

class User extends React.Component {
    constructor(props, context) {
        super(props, context);
        const records = {};
        props.records.forEach(record => {
            records[record.id] = record;
        });
        this.state = {
            record: records,
        };
    }

    render() {
        const {
            user,
            currentUser,
            query,
        } = this.props;
        const canEdit = currentUser && currentUser.id === user.id;
        var {type, category, sort} = query;
        if (!sort) sort = 'date';
        return <Layout.CenteredFullWidth className="user-container">
            <div className="nav-user">
                <h1><Link to={""}>{user.name} 사용자</Link></h1>
                <p>
                    <Link to={""}>작품 목록</Link>
                    <Link to={`history/`}>기록 내역</Link>
                    {canEdit && <Link to="/records/add/" className="add-record">작품 추가</Link>}
                </p>
            </div>
            <div className="user-content">
                <Library
                    count={RecordStore.getCount(this.state)}
                    query={query}
                    records={RecordStore.query(this.state, type, category, sort)}
                    categoryStats={RecordStore.getCategoryStats(this.state)}
                    categoryList={user.categories}
                    statusTypeStats={RecordStore.getStatusTypeStats(this.state)}
                />
            </div>
        </Layout.CenteredFullWidth>;
    }
}

User.fetchData = async ({ client, params, query }) => {
    const {username} = params;
    const [currentUser, user, records] = await Promise.all([
        client.getCurrentUser(),
        client.call(`/users/${encodeURIComponent(username)}`),
        client.call(`/users/${encodeURIComponent(username)}/records`, {
            include_has_newer_episode: JSON.stringify(true),
        }),
    ]);
    return {
        props: {
            currentUser,
            user,
            records,
            query,
        }
    };
};

export default User;
