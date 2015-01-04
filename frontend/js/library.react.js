/* global PreloadData */
require('object.assign').shim();
var React = require('react/addons');
var Router = require('react-router');
var RecordActions = require('./RecordActions');
var CategoryActions = require('./CategoryActions');
var PostStore = require('./PostStore');
require('../less/library.less');

var App = React.createClass({
    mixins: [Router.Navigation, Router.State],

    render() {
        var user = PreloadData.owner;
        var canEdit = PreloadData.current_user && PreloadData.current_user.id == user.id;
        var key = this.getParams().recordId;
        return <Router.RouteHandler
            user={user}
            canEdit={canEdit}
            key={key} />;
    },

    componentDidMount() {
        $('#nav').on('click', 'a[data-route]', event => {
            event.preventDefault();
            this.transitionTo(event.target.getAttribute('data-route'));
        });
    }
});

var initialLoad = true;

function onPageTransition() {
    if (!initialLoad) {
        _gaq.push(['_trackPageview']);
    }
    initialLoad = false;
}

var supportsHistory = require('react-router/modules/utils/supportsHistory');

function runApp() {
    var locationStrategy = Router.HistoryLocation;
    var libraryPath = '/users/' + PreloadData.owner.name + '/';
    if (!supportsHistory()) {
        if (location.pathname.match(/^\/records\//)) {
            // /records/add/ -> /users/owner/#/records/add/
            // /records/12345/ -> /users/owner/#/records/12345/
            location.href = libraryPath + '#' + location.pathname;
            return;
        }
        locationStrategy = Router.HashLocation;
        libraryPath = '/';
    }

    var {Route, DefaultRoute} = Router;
    var routes = (
        <Route path={libraryPath} handler={App}>
            <DefaultRoute name="records" handler={require('./Library')} />
            <Route name="add-record" path="/records/add/:title?/?" handler={require('./AddRecord')} />
            <Route name="manage-category" path="/records/category/" handler={require('./ManageCategory')} />
            <Route name="record" path="/records/:recordId/" handler={require('./RecordDetail')} />
            <Route name="history" path={libraryPath + "history/"} handler={require('./LibraryHistory')} />
        </Route>
    );
    RecordActions.loadRecords(PreloadData.records);
    CategoryActions.loadCategories(PreloadData.categories);
    Router.run(routes, locationStrategy, (Handler) => {
        onPageTransition();
        React.render(<Handler />, $('.library-container')[0]);
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
