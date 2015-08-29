/* global PreloadData */
var $ = require('jquery');
var React = require('react/addons');
var Router = require('react-router');
var {Link} = Router;
var RecordActions = require('./RecordActions');
var CategoryActions = require('./CategoryActions');
var UserActions = require('./UserActions');
var PostStore = require('./PostStore');
var Layout = require('./Layout');
var GlobalHeader = require('./GlobalHeader');
require('../less/library.less');

class App extends React.Component {
    render() {
        var user = this.props.owner;
        var canEdit = this.props.currentUser && this.props.currentUser.id == user.id;
        return <div>
            <GlobalHeader currentUser={this.props.currentUser} />
            <Layout.CenteredFullWidth className="user-container">
                <div className="nav-user">
                    <h1><Link to="records">{user.name} 사용자</Link></h1>
                    <p>
                        <Link to="records">작품 목록</Link>
                        <Link to="history">기록 내역</Link>
                        {canEdit && <Link to="add-record" className="add-record">작품 추가</Link>}
                    </p>
                </div>
                <div className="user-content">
                    {this.props.children}
                </div>
            </Layout.CenteredFullWidth>
        </div>;
    }
}

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
            <Router.RouteHandler
                user={user}
                canEdit={canEdit}
                key={key}
            />
        </App>;
    }
});

var initialLoad = true;

function onPageTransition() {
    if (!initialLoad) {
        _gaq.push(['_trackPageview']);
    }
    initialLoad = false;
}

var supportsHistory = require('./supportsHistory');

function runApp() {
    var locationStrategy = Router.HistoryLocation;
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
        locationStrategy = Router.HashLocation;
        libraryPath = '/';
    }

    var {Route, DefaultRoute} = Router;
    var routes = (
        <Route path={libraryPath} handler={AppContainer}>
            <DefaultRoute name="records" handler={require('./Library')} />
            <Route name="add-record" path="/records/add/:title?/?" handler={require('./AddRecord')} />
            <Route name="manage-category" path="/records/category/" handler={require('./ManageCategory')} />
            <Route name="delete-record" path="/records/:recordId/delete/" handler={require('./DeleteRecord')} />
            <Route name="record" path="/records/:recordId/" handler={require('./RecordDetail')} />
            <Route name="history" path={libraryPath + "history/"} handler={require('./LibraryHistory')} />
            <Route name="settings" path="/settings/" handler={require('./Settings')} />
        </Route>
    );
    RecordActions.loadRecords(PreloadData.records);
    CategoryActions.loadCategories(PreloadData.owner.categories);
    if (PreloadData.current_user)
        UserActions.loadCurrentUser(PreloadData.current_user);
    Router.run(routes, locationStrategy, (Handler) => {
        onPageTransition();
        React.render(<Handler />, document.getElementById('app'));
    });
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
