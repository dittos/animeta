import * as React from 'react';
import { Link } from 'nuri';
import * as util from '../util';
import Styles from './WorkStatusButton.less';

function WorkStatusButton({ work, record }) {
  if (record) {
    return (
      <Link className={Styles.editButton} to={`/records/${record.id}/`}>
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
      <Link
        className={Styles.addButton}
        to={'/records/add/' + encodeURIComponent(work.title) + '/'}
        queryParams={{ref: 'Work'}}
        stacked
      >
        <i className="fa fa-plus" />
        작품 추가
      </Link>
    );
  }
}

export default WorkStatusButton;
