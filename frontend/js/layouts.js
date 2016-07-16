import React from 'react';
import {Link} from 'nuri';
import GlobalHeader from './ui/GlobalHeader';
import Layout from './ui/Layout';

export function App(Component) {
    return (props) => <div>
        <GlobalHeader
            currentUser={props.data.currentUser}
            useRouterLink={true}
            {...props.globalHeaderProps}
        />
        <Component {...props} />
    </div>;
}

// TODO: css module
export function User(Component) {
    return App((props) => {
        const {user, currentUser} = props.data;
        const canEdit = currentUser && currentUser.id === user.id;
        const basePath = `/users/${encodeURIComponent(user.name)}/`;
        return <Layout.CenteredFullWidth className="user-container">
            <div className="nav-user">
                <h1><Link to={basePath}>{user.name} 사용자</Link></h1>
                <p>
                    <Link to={basePath}>작품 목록</Link>
                    <Link to={`${basePath}history/`}>기록 내역</Link>
                    {canEdit && <Link to="/records/add/" className="add-record">작품 추가</Link>}
                </p>
            </div>
            <div className="user-content">
                <Component {...props} />
            </div>
        </Layout.CenteredFullWidth>;
    });
}
