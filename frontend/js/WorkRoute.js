var React = require('react');
var {Route, Link} = require('react-router');
var cx = require('classnames');
var Isomorphic = require('./Isomorphic');
var WorkViews = require('./ui/WorkViews');
var {getStatusDisplay} = require('./util');

const POSTS_PER_PAGE = 10;

var Episodes = React.createClass({
    render() {
        const {work} = this.props;
        const title = encodeURIComponent(work.title);
        return <div className="episodes">
            <Link to={`/works/${title}/`} activeClassName="active" className="recent">최신</Link>
            {work.episodes.map(ep =>
                <Link to={`/works/${title}/ep/${ep.number}/`}
                    activeClassName="active"
                    className={cx({
                        'has-post': ep.post_count > 0,
                        'active': ep.number == this.props.activeEpisodeNumber
                    })}
                    key={ep.number}>{ep.number}화</Link>)}
        </div>;
    }
});

var WorkRoute = React.createClass({
    render() {
        var work = this.props.work;
        return <WorkViews.Work
            work={work}
            chart={this.props.chart}
        >
            <Episodes work={work} />
            {this.props.children}
        </WorkViews.Work>;
    }
});

var WorkIndexRoute = React.createClass({
    render() {
        return <WorkViews.WorkIndex
            pageSize={POSTS_PER_PAGE}
            work={this.props.work}
            initialPosts={this.props.posts}
            hasMore={this.props.posts.length > POSTS_PER_PAGE}
            episode={this.props.params.episode}
        />;
    }
});

var PostRoute = React.createClass({
    render() {
        const {work, chart, post} = this.props;
        return (
            <WorkViews.Work
                work={work}
                chart={chart}
            >
                <Episodes
                    work={work}
                    activeEpisodeNumber={post.status}
                />
                <div className="post-detail">
                    <WorkViews.Post post={post} />
                </div>
                <WorkViews.WorkIndex
                    work={work}
                    episode={post.status}
                    excludePostID={post.id} />
            </WorkViews.Work>
        );
    }
});

var WorkContainer = Isomorphic.createContainer(WorkRoute, {
    getPreloadKey({ params }) {
        return `work/${params.splat}`;
    },

    async fetchData(client, props) {
        const {splat: title} = props.params;
        const [work, chart] = await* [
            client.call('/works/_/' + encodeURIComponent(title)),
            client.call('/charts/works/weekly', {limit: 5}),
        ];
        return {
            work,
            chart
        };
    }
});

var WorkIndexContainer = Isomorphic.createContainer(WorkIndexRoute, {
    getPreloadKey({ params }) {
        return `work/${params.splat}/posts/${params.episode}`;
    },

    async fetchData(client, props) {
        const {splat: title, episode} = props.params;
        const work = await client.call('/works/_/' + encodeURIComponent(title));
        const params = {count: POSTS_PER_PAGE + 1};
        if (episode) {
            params.episode = episode;
        }
        const posts = await client.call(`/works/${work.id}/posts`, params);
        return {
            work,
            posts,
        };
    },

    getTitle(props, data) {
        var title = data.work.title;
        const episode = props.params.episode;
        if (episode) {
            title += ` ${episode}화`;
        }
        return title;
    },

    getMeta(props, data) {
        const work = data.work;
        const title = work.title;
        return {
            og_url: `/works/${encodeURIComponent(title)}/`,
            og_type: 'tv_show',
            og_image: work.metadata && work.metadata.image_url,
            tw_image: work.metadata && work.metadata.image_url,
        }
    }
});

var PostContainer = Isomorphic.createContainer(PostRoute, {
    getPreloadKey({ params }) {
        return `post/${params.id}`;
    },

    async fetchData(client, props) {
        const {id} = props.params;
        const post = await client.call(`/posts/${id}`);
        const [work, chart] = await* [
            client.call(`/works/${post.record.work_id}`),
            client.call('/charts/works/weekly', {limit: 5}),
        ];
        return {
            work,
            chart,
            post
        };
    },

    getTitle(props, data) {
        return `${data.post.user.name} 사용자 > ${data.work.title} ${getStatusDisplay(data.post)}`;
    }
});

var routes = <Route ignoreScrollBehavior>
    <Route component={WorkContainer}>
        <Route component={WorkIndexContainer} path="/works/**/ep/:episode/" />
        <Route component={WorkIndexContainer} path="/works/**/" />
    </Route>
    <Route component={PostContainer} path="/-:id" />
</Route>;

module.exports = routes;
