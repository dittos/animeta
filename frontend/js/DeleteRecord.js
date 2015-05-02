var React = require('react/addons');
var Router = require('react-router');
var RecordActions = require('./RecordActions');
var RecordStore = require('./RecordStore');

var DeleteRecord = React.createClass({
    getInitialState() {
        return {
            record: RecordStore.get(this.props.recordId)
        };
    },
    render() {
        return <div className="library-record-delete">
            <h2>기록 삭제</h2>
            <p>'{this.state.record.title}'에 대한 기록을 모두 삭제합니다. </p>
            <p>주의: <strong>일단 삭제하면 되돌릴 수 없으니</strong> 신중하게 생각하세요.</p>
            <p><button onClick={this._onDelete}>확인</button></p>
        </div>;
    },
    _onDelete() {
        RecordActions.deleteRecord(this.state.record.id).then(() => {
            this.props.onDelete();
        });
    }
});

var DeleteRecordContainer = React.createClass({
    mixins: [Router.Navigation],
    render() {
        return <DeleteRecord
            {...this.props}
            recordId={this.props.params.recordId}
            onDelete={this._onDelete}
        />;
    },
    _onDelete() {
        this.transitionTo('records');
    }
});

module.exports = DeleteRecordContainer;
