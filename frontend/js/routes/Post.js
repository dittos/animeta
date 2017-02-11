import React from 'react';
import * as WorkViews from '../ui/WorkViews';
import {getStatusDisplay} from '../util';
import {App} from '../layouts';
// TODO: css module

const POSTS_PER_PAGE = 10;

class Post extends React.Component {
    componentDidMount() {
        // lazy load
        this._loadMorePosts();
    }

    render() {
        const {
            work,
            chart,
            posts,
            hasMorePosts,
            post,
        } = this.props.data;
        return (
            <WorkViews.Work
                work={work}
                chart={chart}
            >
                <WorkViews.Episodes
                    work={work}
                    activeEpisodeNumber={post.status}
                />
                <div className="post-detail">
                    <WorkViews.Post post={post} />
                </div>
                <WorkViews.WorkIndex
                    work={work}
                    episode={post.status}
                    posts={posts}
                    hasMorePosts={hasMorePosts}
                    loadMorePosts={this._loadMorePosts}
                    excludePostID={post.id}
                />
            </WorkViews.Work>
        );
    }

    _loadMorePosts = async () => {
        const {
            work,
            posts,
            post,
        } = this.props.data;
        var params = {count: POSTS_PER_PAGE + 1, episode: post.status};
        if (posts && posts.length > 0)
            params.before_id = posts[posts.length - 1].id;
        const result = await this.props.loader.call(`/works/${work.id}/posts`, params);
        this.props.writeData(data => {
            if (!data.posts)
                data.posts = [];
            data.posts = data.posts.concat(result.slice(0, POSTS_PER_PAGE));
            data.hasMorePosts = result.length > POSTS_PER_PAGE;
        });
    };
}

const Component = App(Post);

export default {
    component: (props) => {
        return <Component
            {...props}
            globalHeaderProps={{mobileSpecial: true}}
        />;
    },

    async load({ params, loader }) {
        const {id} = params;
        const [currentUser, post, chart] = await Promise.all([
            loader.getCurrentUser(),
            loader.call(`/posts/${id}`),
            loader.call('/charts/works/weekly', {limit: 5}),
        ]);
        const work = await loader.call(`/works/${post.record.work_id}`);
        return {
            currentUser,
            post,
            chart,
            work,
        };
    },

    renderTitle({ post, work }) {
        return `${post.user.name} 사용자 > ${work.title} ${getStatusDisplay(post)}`;
    },

    renderMeta({ post, work }) {
        return {
            og_url: `/-${post.id}`,
            og_type: 'article',
            og_image: work.image_url,
            tw_image: work.image_url,
        };
    }
};
