var React = require('react');
var LinkedStateMixin = require('react-addons-linked-state-mixin');
var StatusInput = require('./StatusInput');
var util = require('../util');
var LocalStorage = require('../LocalStorage');
var Styles = require('./PostComposer.less');

var PostComposer = React.createClass({
    mixins: [LinkedStateMixin],

    getInitialState() {
        return {
            statusType: this.props.record.status_type,
            status: util.plusOne(this.props.record.status),
            comment: '',
            publishTwitter: false,
            containsSpoiler: false,
        };
    },

    componentDidMount() {
        this.setState({publishTwitter: LocalStorage.getItem('publishTwitter') === 'true'});
    },

    render() {
        const {record, currentUser} = this.props;
        var currentStatus;
        if (record.status) {
            currentStatus = <span className={Styles.currentProgress}>{record.status} &rarr; </span>;
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
                placeholder="감상평 (선택사항)"
                valueLink={this.linkState('comment')} />
            <div className={Styles.actions}>
                <label>
                    <input type="checkbox" name="contains_spoiler"
                        checkedLink={this.linkState('containsSpoiler')} />
                    {' 내용 누설 포함'}
                </label>
                <label>
                    <input type="checkbox" name="publish_twitter"
                        checked={currentUser.is_twitter_connected && this.state.publishTwitter}
                        onChange={this._onPublishTwitterChange} />
                    {' 트위터에 공유'}
                </label>
                <button type="button" onClick={this._onSubmit}>기록 추가</button>
            </div>
        </form>;
    },

    _onStatusChange(newValue) {
        this.setState({status: newValue});
    },

    _onPublishTwitterChange(event) {
        if (!this.props.currentUser.is_twitter_connected) {
            this.props.onTwitterConnect().then(() => {
                this.setState({publishTwitter: true});
            });
        } else {
            this.setState({publishTwitter: event.target.checked});
        }
    },

    _onSubmit(event) {
        event.preventDefault();
        const {status, statusType, comment, containsSpoiler, publishTwitter} = this.state;
        this.props.onSave({status, statusType, comment, containsSpoiler, publishTwitter});
    },
});

module.exports = PostComposer;
