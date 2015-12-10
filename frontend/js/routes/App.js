import React from 'react';
import {createContainer} from '../Isomorphic';
import GlobalHeader from '../ui/GlobalHeader';

var App = React.createClass({
    render() {
        return <div>
            <GlobalHeader currentUser={this.props.current_user} />
            {this.props.children}
        </div>;
    }
});

export default createContainer(App, {
    getPreloadKey: () => 'chartApp',

    async fetchData(client) {
        return {
            current_user: await client.getCurrentUser(),
        };
    }
});
