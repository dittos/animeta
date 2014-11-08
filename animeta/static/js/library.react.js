/* global PreloadData */
require('object.assign').shim();
var React = require('react/addons');
var {Routes, Route, DefaultRoute, Navigation} = require('react-router');
var RecordStore = require('./RecordStore');
require('../less/library.less');

var App = React.createClass({
    mixins: [Navigation],

    render() {
        var user = PreloadData.owner;
        user.categoryList = PreloadData.categories;
        var canEdit = PreloadData.current_user && PreloadData.current_user.id == user.id;
        return this.props.activeRouteHandler({
            user: user,
            canEdit: canEdit
        });
    },

    componentDidMount() {
        $('#nav h1 a').on('click', event => {
            event.preventDefault();
            this.transitionTo('records');
        });
        $('#nav .add-record').on('click', event => {
            event.preventDefault();
            this.transitionTo('add-record');
        });
    }
});

RecordStore.preload(PreloadData.records);

var initialLoad = true;

function onPageTransition() {
    if (!initialLoad) {
        _gaq.push(['_trackPageview']);
    }
    initialLoad = false;
}

var supportsHistory = require('react-router/modules/utils/supportsHistory');

function initRouter() {
    var locationStrategy = 'history';
    var libraryPath = '/users/' + PreloadData.owner.name + '/';
    if (!supportsHistory()) {
        if (location.pathname.match(/^\/records\//)) {
            // /records/add/ -> /users/owner/#/records/add/
            // /records/12345/ -> /users/owner/#/records/12345/
            location.href = libraryPath + '#' + location.pathname;
            return;
        }
        locationStrategy = 'hash';
        libraryPath = '/';
    }

    React.render(
        <Routes location={locationStrategy} onChange={onPageTransition}>
            <Route path={libraryPath} handler={App}>
                <DefaultRoute name="records" handler={require('./Library')} />
                <Route name="add-record" path="/records/add/:title?/?" handler={require('./AddRecord')} />
                <Route name="record" path="/records/:recordId/" handler={require('./RecordDetail')} addHandlerKey={true} />
            </Route>
        </Routes>,
    $('.library-container')[0]);
}

initRouter();

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
    if (RecordStore.hasPendingPosts()) {
        return '아직 저장 중인 기록이 있습니다.';
    }
});
