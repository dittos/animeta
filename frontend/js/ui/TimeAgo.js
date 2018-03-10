import React from 'react';
import distanceInWordsToNow from 'date-fns/distance_in_words_to_now';
import koLocale from 'date-fns/locale/ko';

class TimeAgo extends React.Component {
    state = {};

    render() {
        return (
            <span title={this.state.title}>
                {distanceInWordsToNow(this.props.time, {
                    addSuffix: true,
                    locale: koLocale,
                })}
            </span>
        );
    }

    componentDidMount() {
        this._timer = setInterval(this.forceUpdate.bind(this), 60 * 1000);
        this._syncState(this.props);
    }

    componentWillUnmount() {
        if (this._timer) {
            clearInterval(this._timer);
        }
    }

    componentWillReceiveProps(nextProps) {
        this._syncState(nextProps);
    }

    _syncState = props => {
        // Store title in state to workaround difference between server and client
        this.setState({
            title: new Date(props.time).toLocaleString(),
        });
    };
}

module.exports = TimeAgo;
