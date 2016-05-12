import React from 'react';
import Relay from 'react-relay';
import {DeleteRecordMutation} from '../mutations/RecordMutations';

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
        Relay.Store.commitUpdate(new DeleteRecordMutation({record: this.props.record}), {
            onSuccess: () => this.props.onDelete()
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

export default Relay.createContainer(DeleteRecordRoute, {
    fragments: {
        record: () => Relay.QL`
            fragment on Record {
                title
                ${DeleteRecordMutation.getFragment('record')}
            }
        `
    }
});
