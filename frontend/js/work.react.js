var React = require('react/addons');
var Router = require('react-router');
var GlobalHeader = require('./GlobalHeader');
var WorkViews = require('./WorkViews');
if (process.env.CLIENT) {
    require('../less/work.less?extract');
}

var App = React.createClass({
    render() {
        return <div>
            <GlobalHeader currentUser={this.props.PreloadData.current_user} />
            <Router.RouteHandler work={this.props.PreloadData.work}
                chart={this.props.PreloadData.chart} />
        </div>;
    }
});

var WorkRoute = React.createClass({
    mixins: [Router.State],
    render() {
        var work = this.props.work;
        var episode = this.getParams().episode;
        return <WorkViews.Work
            work={work}
            chart={this.props.chart}
        >
            <div className="episodes">
                <Router.Link to="work-index" className="recent">최신</Router.Link>
                {work.episodes.map(ep =>
                    <Router.Link to="work-episode" params={{episode: ep.number}} className={ep.post_count > 0 ? 'has-post' : ''}>{ep.number}화</Router.Link>)}
            </div>
            <Router.RouteHandler work={work} key={episode} />
        </WorkViews.Work>;
    }
});

var WorkIndexRoute = React.createClass({
    mixins: [Router.State],
    render() {
        return <WorkViews.WorkIndex
            work={this.props.work}
            episode={this.getParams().episode} />;
    }
});

var {Route, DefaultRoute} = Router;
var routes = <Route handler={App}>
    <Route handler={WorkRoute} path="/" ignoreScrollBehavior>
        <DefaultRoute name="work-index" handler={WorkIndexRoute} />
        <Route name="work-episode" handler={WorkIndexRoute} path="/ep/:episode/" />
    </Route>
</Route>;

var initialLoad = true;

function onPageTransition() {
    if (!initialLoad) {
        _gaq.push(['_trackPageview']);
    }
    initialLoad = false;
}

if (process.env.CLIENT) {
    Router.run(routes, Router.HashLocation, (Handler) => {
        onPageTransition();
        React.render(<Handler PreloadData={global.PreloadData} />,
            document.getElementById('app'));
    });
} else {
    module.exports = routes;
}
