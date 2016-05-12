/* global PreloadData */
/* global _gaq */
var $ = require('jquery');
import React from 'react';
import ReactDOM from 'react-dom';
import {Route, IndexRoute, Link} from 'react-router';
import Relay from 'react-relay';
import {RelayRouter} from 'react-router-relay';
import LibraryRoute from './ui/Library';
import ManageCategoryRoute from './ui/ManageCategory';
import RecordDetailRoute from './ui/RecordDetail';
import AddRecordRoute from './ui/AddRecord';
import DeleteRecordRoute from './ui/DeleteRecord';
var createBrowserHistory = require('history/lib/createBrowserHistory');
var createHashHistory = require('history/lib/createHashHistory');
var Layout = require('./ui/Layout');
var GlobalHeader = require('./ui/GlobalHeader');
var CSRF = require('./CSRF');
require('../less/library.less');

function App({user, viewer, history, children}) {
    var canEdit = viewer && viewer.id === user.id;
    return <div>
        <GlobalHeader currentUser={viewer} />
        <Layout.CenteredFullWidth className="user-container">
            <div className="nav-user">
                <h1><Link to={history.libraryPath}>{user.name} 사용자</Link></h1>
                <p>
                    <Link to={history.libraryPath}>작품 목록</Link>
                    <Link to={`${history.libraryPath}history/`}>기록 내역</Link>
                    {canEdit && <Link to="/records/add/" className="add-record">작품 추가</Link>}
                </p>
            </div>
            <div className="user-content">
                {children}
            </div>
        </Layout.CenteredFullWidth>
    </div>;
}

const AppRoute = Relay.createContainer(App, {
    fragments: {
        user: () => Relay.QL`fragment on User { id, name }`,
        viewer: () => Relay.QL`fragment on User { id, name }`
    }
});

function onPageTransition() {
    _gaq.push(['_trackPageview']);
}

var supportsHistory = require('history/lib/DOMUtils').supportsHistory;

function runApp() {
    var locationStrategy;
    var libraryPath = '/users/' + PreloadData.username + '/';
    if (!supportsHistory()) {
        // TODO: handle URL coming from hash location
        // in history supported environment.
        var path = location.pathname;
        if (path != libraryPath) {
            // /records/add/ -> /users/owner/#/records/add/
            // /records/12345/ -> /users/owner/#/records/12345/
            // /users/owner/history/ -> /users/owner/#/history/
            if (path.indexOf(libraryPath) === 0)
                path = path.substring(libraryPath.length);
            location.href = libraryPath + '#' + path;
            return;
        }
        locationStrategy = createHashHistory({queryKey: false});
        locationStrategy.libraryPath = '/';
    } else {
        locationStrategy = createBrowserHistory();
        locationStrategy.libraryPath = libraryPath;
    }

    const UserQueries = {
        user: () => Relay.QL`query { user(name: $name) }`,
    };
    const ViewerQueries = {
        viewer: () => Relay.QL`query { viewer }`
    };
    const RecordQueries = {
        record: () => Relay.QL`query { node(id: $recordId) }`,
    };

    function usernamePreparer() {
        return {name: PreloadData.username};
    }
    function recordIdPreparer({recordId}) {
        return {recordId: `Record:${recordId}`};
    }

    var routes = (
        <Route
            path={locationStrategy.libraryPath}
            component={AppRoute}
            queries={{...UserQueries, ...ViewerQueries}}
            prepareParams={usernamePreparer}
        >
            <IndexRoute
                component={LibraryRoute}
                queries={{...UserQueries, ...ViewerQueries}}
                prepareParams={usernamePreparer}
            />
            <Route
                path="/records/add/(:title/)"
                component={AddRecordRoute}
                queries={ViewerQueries}
            />
            <Route
                path="/records/category/"
                component={ManageCategoryRoute}
                queries={ViewerQueries}
            />
            <Route
                path="/records/:recordId/delete/"
                component={DeleteRecordRoute}
                queries={RecordQueries}
                prepareParams={recordIdPreparer}
            />
            <Route
                path="/records/:recordId/"
                component={RecordDetailRoute}
                queries={{...ViewerQueries, ...RecordQueries}}
                prepareParams={recordIdPreparer}
            />
            <Route path={locationStrategy.libraryPath + "history/"} component={require('./ui/LibraryHistory')} />
            <Route path="/settings/" component={require('./ui/Settings').default} />
        </Route>
    );

    Relay.injectNetworkLayer(
        new Relay.DefaultNetworkLayer('/graphql', {
            credentials: 'same-origin',
            headers: {
                'X-CSRF-Token': CSRF.getToken()
            }
        })
    );

    ReactDOM.render(
        <RelayRouter
            history={locationStrategy}
            onUpdate={onPageTransition}
            routes={routes} />,
        document.getElementById('app'));
}

runApp();

$(document).ajaxError((event, jqXHR) => {
    if (jqXHR.responseText) {
        try {
            var err = $.parseJSON(jqXHR.responseText);
            alert(err.message);
            return;
        } catch (e) {
            // ignore
        }
    }
    alert('서버 오류로 요청에 실패했습니다.');
});

//$(window).on('beforeunload', () => {
//    if (PostStore.hasPendingPosts()) {
//        return '아직 저장 중인 기록이 있습니다.';
//    }
//});
