import React from 'react';

export default class TempRouterProvider extends React.Component {
    getChildContext() {
        const {history} = this.props;
        return {history};
    }

    render() {
        return this.props.children;
    }
}
TempRouterProvider.childContextTypes = {
    history: React.PropTypes.object
};
