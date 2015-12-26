var React = require('react');
var {connect} = require('react-redux');
var RecordActions = require('../store/RecordActions');
var RecordStore = require('../store/RecordStore');

var DeleteRecord = React.createClass({
    render() {
        return <div className="library-record-delete">
            <h2>기록 삭제</h2>
            <p>'{this.props.record.title}'에 대한 기록을 모두 삭제합니다. </p>
            <p>주의: <strong>일단 삭제하면 되돌릴 수 없으니</strong> 신중하게 생각하세요.</p>
            <p><button onClick={this._onDelete}>확인</button></p>
        </div>;
    },
    _onDelete() {
        this.props.dispatch(RecordActions.deleteRecord(this.props.record.id)).then(() => {
            this.props.onDelete();
        });
    }
});

var DeleteRecordRoute = React.createClass({
    render() {
        return <DeleteRecord
            {...this.props}
            onDelete={this._onDelete}
        />;
    },
    _onDelete() {
        this.props.history.pushState(null, this.props.history.libraryPath);
    }
});

function select(state, props) {
    return {
        record: RecordStore.get(state, props.params.recordId),
    };
}

module.exports = connect(select)(DeleteRecordRoute);
