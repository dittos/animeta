var React = require('react');
var ReactDOM = require('react-dom');
var Router = require('react-router');
var createHashHistory = require('history/lib/createHashHistory');
var GlobalHeader = require('./ui/GlobalHeader');
var WorkViews = require('./ui/WorkViews');
if (process.env.CLIENT) {
    require('../less/work.less?extract');
}

var App = React.createClass({
    render() {
        var data = global.PreloadData;
        return <div>
            <GlobalHeader currentUser={data.current_user} />
            {React.cloneElement(
                this.props.children,
                {
                    work: data.work,
                    chart: data.chart
                }
            )}
        </div>;
    }
});

var Work = React.createClass({
    render() {
        var work = this.props.work;
        return <WorkViews.Work
            work={work}
            chart={this.props.chart}
        >
            <div className="episodes">
                <Router.Link to="/" activeClassName="active" className="recent">최신</Router.Link>
                {work.episodes.map(ep =>
                    <Router.Link to={`/ep/${ep.number}/`}
                        activeClassName="active"
                        className={ep.post_count > 0 ? 'has-post' : ''}>{ep.number}화</Router.Link>)}
            </div>
            {this.props.children}
        </WorkViews.Work>;
    }
});

var WorkRoute = React.createClass({
    render() {
        var work = this.props.work;
        var episode = this.props.params.episode;
        return <Work
            {...this.props}
            episode={episode}
        >
            {React.cloneElement(this.props.children, {work: work, key: episode})}
        </Work>;
    }
});

var WorkIndexRoute = React.createClass({
    render() {
        return <WorkViews.WorkIndex
            work={this.props.work}
            episode={this.props.params.episode} />;
    }
});

var {Route, IndexRoute} = Router;
var routes = <Route component={App}>
    <Route component={WorkRoute} path="/" ignoreScrollBehavior>
        <IndexRoute component={WorkIndexRoute} />
        <Route component={WorkIndexRoute} path="ep/:episode/" />
    </Route>
</Route>;

function onPageTransition() {
    _gaq.push(['_trackPageview']);
}

if (process.env.CLIENT) {
    ReactDOM.render(<Router.Router history={createHashHistory({queryKey: false})} onUpdate={onPageTransition}>{routes}</Router.Router>,
        document.getElementById('app'));
} else {
    module.exports = routes;
}
