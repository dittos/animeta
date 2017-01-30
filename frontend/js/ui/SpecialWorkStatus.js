import React from 'react';
import * as util from '../util';
import Styles from './SpecialWorkStatus.less';

class SpecialWorkStatus extends React.Component {
    render() {
        const {
            work,
            record,
            onInterestedClick,
        } = this.props;

        if (record) {
            return (
                <a className={Styles.editButton}
                    href={`/records/${record.id}/`}>
                    <i className="fa fa-pencil" />
                    {util.STATUS_TYPE_TEXT[record.status_type]}
                    {record.status &&
                        <span className={Styles.editButtonSubtext}>@ {util.getStatusDisplay(record)}</span>}
                </a>
            );
        } else {
            return (
                <div>
                    <a className={Styles.addButton}
                        href={'/records/add/' + encodeURIComponent(work.title) + '/'}>
                        <i className="fa fa-plus" />
                        작품 추가
                    </a>
                    <div className={Styles.buttonSeparator} />
                    <div className={Styles.interestedButton}
                        onClick={onInterestedClick}>
                        <i className="fa fa-star" />
                    </div>
                </div>
            );
        }
    }
}

export default SpecialWorkStatus;
