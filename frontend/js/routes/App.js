import React from 'react';
import {createContainer} from '../Isomorphic';
import GlobalHeader from '../ui/GlobalHeader';
import {loadCurrentUserFromClient} from '../store/AppActions';

var App = React.createClass({
    render() {
        return <div>
            <GlobalHeader
                currentUser={this.props.currentUser}
                useRouterLink={true}
            />
            {this.props.children}
        </div>;
    }
});

export default createContainer(App, {
    select(state) {
        return {
            currentUser: state.app.currentUser,
        };
    },

    fetchData(getState, dispatch) {
        return dispatch(loadCurrentUserFromClient());
    },

    hasCachedData(state) {
        return state.app.isCurrentUserLoaded;
    }
});
