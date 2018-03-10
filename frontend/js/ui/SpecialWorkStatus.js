import React from 'react';
import { Link } from 'nuri';
import * as util from '../util';
import AddRecordDialog from './AddRecordDialog';
import Styles from './SpecialWorkStatus.less';

class SpecialWorkStatus extends React.Component {
    state = {
        showAddModal: false,
    };

    render() {
        const { work, record } = this.props;

        if (record) {
            return (
                <Link
                    className={Styles.editButton}
                    to={`/records/${record.id}/`}
                >
                    <i className="fa fa-pencil" />
                    {util.STATUS_TYPE_TEXT[record.status_type]}
                    {record.status && (
                        <span className={Styles.editButtonSubtext}>
                            @ {util.getStatusDisplay(record)}
                        </span>
                    )}
                </Link>
            );
        } else {
            return (
                <div>
                    <Link
                        className={Styles.addButton}
                        to={
                            '/records/add/' +
                            encodeURIComponent(work.title) +
                            '/'
                        }
                        onClick={this._showAddModal}
                    >
                        <i className="fa fa-plus" />
                        작품 추가
                    </Link>
                    {this.state.showAddModal && (
                        <AddRecordDialog
                            initialTitle={work.title}
                            onCancel={() =>
                                this.setState({ showAddModal: false })
                            }
                            onCreate={this._recordAdded}
                        />
                    )}
                </div>
            );
        }
    }

    _showAddModal = event => {
        event.preventDefault();
        this.setState({ showAddModal: true });
    };

    _recordAdded = result => {
        this.setState({ showAddModal: false });
        this.props.onAddRecord(result.record);
    };
}

export default SpecialWorkStatus;
