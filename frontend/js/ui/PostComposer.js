import React from 'react';
import LinkedStateMixin from 'react-addons-linked-state-mixin';
import Relay from 'react-relay';
import {
    connectTwitter,
    getLastPublishOptions,
    setLastPublishOptions,
} from '../ExternalServices';
import {plusOne} from '../util';
import {
    CreatePostMutation,
} from '../mutations/PostMutations';
import {
    RefreshViewerConnectedServicesMutation,
} from '../mutations/UserMutations';
import StatusInput from './StatusInput';
import Styles from './PostComposer.less';

var PostComposer = React.createClass({
    mixins: [LinkedStateMixin],

    getInitialState() {
        return {
            statusType: this.props.record.status_type,
            status: plusOne(this.props.record.status),
            comment: '',
            publishOptions: getLastPublishOptions(),
            containsSpoiler: false,
        };
    },

    render() {
        var currentStatus;
        if (this.props.record.status) {
            currentStatus = <span className={Styles.currentProgress}>{this.props.record.status} &rarr; </span>;
        }
        return <form className={Styles.postComposer}>
            <div className={Styles.progress}>
                <select name="status_type"
                    valueLink={this.linkState('statusType')}>
                    <option value="watching">보는 중</option>
                    <option value="finished">완료</option>
                    <option value="suspended">중단</option>
                    <option value="interested">볼 예정</option>
                </select>
                {' @ '}
                {currentStatus}
                <StatusInput name="status"
                    value={this.state.status}
                    onChange={this._onStatusChange} />
            </div>
            <textarea name="comment" rows={3} cols={30} autoFocus
                valueLink={this.linkState('comment')} />
            <div className={Styles.actions}>
                <label>
                    <input type="checkbox" name="contains_spoiler"
                        checkedLink={this.linkState('containsSpoiler')} />
                    {' 내용 누설 포함'}
                </label>
                <label>
                    <input type="checkbox" name="publish_twitter"
                        checked={this._isTwitterConnected() && this.state.publishOptions.has('twitter')}
                        onChange={this._onPublishTwitterChange} />
                    {' 트위터에 공유'}
                </label>
                <button type="button" onClick={this._onSubmit}>기록 추가</button>
            </div>
        </form>;
    },

    _onSubmit(event) {
        event.preventDefault();
        var publishOptions = this.state.publishOptions;
        setLastPublishOptions(publishOptions);
        Relay.Store.commitUpdate(new CreatePostMutation({
            record: this.props.record,
            data: {
                status: this.state.status,
                status_type: this.state.statusType,
                comment: this.state.comment,
                contains_spoiler: this.state.containsSpoiler,
            },
            publishOptions: publishOptions.toJS(),
        }), {
            onSuccess: this.props.onSave
        });
    },

    _onStatusChange(newValue) {
        this.setState({status: newValue});
    },

    _onPublishTwitterChange(event) {
        if (!this._isTwitterConnected()) {
            connectTwitter().then(() => {
                Relay.Store.commitUpdate(new RefreshViewerConnectedServicesMutation({viewer: this.props.viewer}));
                this.setState({publishOptions: this.state.publishOptions.add('twitter')});
            });
        } else {
            var {publishOptions} = this.state;
            if (event.target.checked) {
                publishOptions = publishOptions.add('twitter');
            } else {
                publishOptions = publishOptions.remove('twitter');
            }
            this.setState({publishOptions});
        }
    },

    _isTwitterConnected() {
        return this.props.viewer.connected_services.filter(s => s === 'twitter').length > 0;
    }
});

export default Relay.createContainer(PostComposer, {
    fragments: {
        viewer: () => Relay.QL`
            fragment on User {
                connected_services
                ${RefreshViewerConnectedServicesMutation.getFragment('viewer')}
            }
        `,
        record: () => Relay.QL`
            fragment on Record {
                status
                status_type
                ${CreatePostMutation.getFragment('record')}
            }
        `
    }
});
