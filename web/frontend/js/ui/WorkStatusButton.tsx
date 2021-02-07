import * as React from 'react';
import { Link } from 'nuri';
import * as util from '../util';
import Styles from './WorkStatusButton.less';
import LoginDialog from './LoginDialog';
import { RecordDTO, UserDTO, WorkDTO } from '../../../shared/types_generated';

function WorkStatusButton({ work, record, currentUser }: {
  work: WorkDTO;
  record: RecordDTO | null;
  currentUser: UserDTO | null;
}) {
  if (record) {
    return (
      <Link className={Styles.editButton} to={`/records/${record.id}/`}>
        <i className="fa fa-pencil" />
        {util.STATUS_TYPE_TEXT[record.status_type as keyof typeof util.STATUS_TYPE_TEXT]}
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
        onClick={currentUser ? undefined : (event: React.MouseEvent) => { event.preventDefault(); LoginDialog.open() }}
      >
        <i className="fa fa-plus" />
        작품 추가
      </Link>
    );
  }
}

export default WorkStatusButton;
