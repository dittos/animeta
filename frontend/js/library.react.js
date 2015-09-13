/* global PreloadData */
var $ = require('jquery');
var React = require('react/addons');
var ReactDOM = require('react-dom');
var {Router, Route, IndexRoute, Link, History} = require('react-router');
var createBrowserHistory = require('history/lib/createBrowserHistory');
var createHashHistory = require('history/lib/createHashHistory');
var RecordActions = require('./store/RecordActions');
var CategoryActions = require('./store/CategoryActions');
var UserActions = require('./store/UserActions');
var PostStore = require('./store/PostStore');
var Layout = require('./ui/Layout');
var GlobalHeader = require('./ui/GlobalHeader');
require('../less/library.less');

var App = React.createClass({
    mixins: [History],
    render() {
        var user = this.props.owner;
        var canEdit = this.props.currentUser && this.props.currentUser.id == user.id;
        return <div>
            <GlobalHeader currentUser={this.props.currentUser} />
            <Layout.CenteredFullWidth className="user-container">
                <div className="nav-user">
                    <h1><Link to={this.history.libraryPath}>{user.name} 사용자</Link></h1>
                    <p>
                        <Link to={this.history.libraryPath}>작품 목록</Link>
                        <Link to={`${this.history.libraryPath}/history/`}>기록 내역</Link>
                        {canEdit && <Link to="/records/add/" className="add-record">작품 추가</Link>}
                    </p>
                </div>
                <div className="user-content">
                    {this.props.children}
                </div>
            </Layout.CenteredFullWidth>
        </div>;
    }
});

var AppContainer = React.createClass({
    render() {
        var user = PreloadData.owner;
        var canEdit = PreloadData.current_user && PreloadData.current_user.id == user.id;
        var key = this.props.params && this.props.params.recordId;
        return <App
            {...this.props}
            owner={user}
            currentUser={PreloadData.current_user}
        >
            {React.cloneElement(this.props.children, {
                user, canEdit, key
            })}
        </App>;
    }
});

function onPageTransition() {
    _gaq.push(['_trackPageview']);
}

var supportsHistory = require('history/lib/DOMUtils').supportsHistory;

function runApp() {
    var locationStrategy;
    var libraryPath = '/users/' + PreloadData.owner.name + '/';
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

    var routes = (
        <Route path={libraryPath} component={AppContainer}>
            <IndexRoute component={require('./ui/Library')} />
            <Route path="/records/add/(:title/)" component={require('./ui/AddRecord')} />
            <Route path="/records/category/" component={require('./ui/ManageCategory')} />
            <Route path="/records/:recordId/delete/" component={require('./ui/DeleteRecord')} />
            <Route path="/records/:recordId/" component={require('./ui/RecordDetail')} />
            <Route path={libraryPath + "history/"} component={require('./ui/LibraryHistory')} />
            <Route path="/settings/" component={require('./ui/Settings')} />
        </Route>
    );
    RecordActions.loadRecords(PreloadData.records);
    CategoryActions.loadCategories(PreloadData.owner.categories);
    if (PreloadData.current_user)
        UserActions.loadCurrentUser(PreloadData.current_user);
    ReactDOM.render(<Router history={locationStrategy} onUpdate={onPageTransition}>{routes}</Router>,
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
        }
    }
    alert('서버 오류로 요청에 실패했습니다.');
});

$(window).on('beforeunload', () => {
    if (PostStore.hasPendingPosts()) {
        return '아직 저장 중인 기록이 있습니다.';
    }
});
