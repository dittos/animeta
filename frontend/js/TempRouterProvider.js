import React from 'react';

export default class TempRouterProvider extends React.Component {
    getChildContext() {
        const {app} = this.props;
        return {app};
    }

    render() {
        return this.props.children;
    }
}
TempRouterProvider.childContextTypes = {
    app: React.PropTypes.object
};
