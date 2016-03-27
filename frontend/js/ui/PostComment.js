import React from 'react';
import Styles from './PostComment.less';

export default class PostComment extends React.Component {
    constructor(...args) {
        super(...args);
        this.state = {
            showSpoiler: false
        };
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.post.id !== nextProps.post.id) {
            this.setState({ showSpoiler: false });
        }
    }

    render() {
        const {comment, contains_spoiler} = this.props.post;

        if (!comment)
            return null;

        return <div className={this.props.className}>
            {contains_spoiler && !this.state.showSpoiler && !this.props.showSpoiler ?
                <span className={Styles.spoilerAlert}>
                    <i className="fa fa-microphone-slash" />
                    내용 누설 가림

                    <span
                        className={Styles.revealLink}
                        onClick={this._showSpoiler.bind(this)}
                    >
                        보이기
                    </span>
                </span>
                : comment}
        </div>;
    }

    _showSpoiler() {
        this.setState({ showSpoiler: true });
    }
}
