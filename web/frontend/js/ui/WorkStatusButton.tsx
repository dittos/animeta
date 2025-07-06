import * as React from 'react';
import { Link } from 'nuri';
import * as util from '../util';
import Styles from './WorkStatusButton.module.less';
import LoginDialog from './LoginDialog';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencil, faPlus } from '@fortawesome/free-solid-svg-icons';
import { WorkStatusButton_RecordFragment, WorkStatusButton_WorkFragment } from './__generated__/WorkStatusButton.graphql';

export function WorkStatusButton({ work, record, currentUser }: {
  work: WorkStatusButton_WorkFragment;
  record?: WorkStatusButton_RecordFragment | null;
  currentUser: unknown | null;
}) {
  if (record) {
    return (
      <Link className={Styles.editButton} to={`/records/${record.databaseId}/`}>
        <FontAwesomeIcon icon={faPencil} />
        {record.statusType && util.GQL_STATUS_TYPE_TEXT[record.statusType]}
        {record.status && (
          <span className={Styles.editButtonSubtext}>
            @ {util.getStatusDisplayGql(record)}
          </span>
        )}
      </Link>
    );
  } else {
    return (
      <Link
        className={Styles.addButton}
        to={'/records/add/' + encodeURIComponent(work.title!) + '/'}
        queryParams={{ref: 'Work'}}
        stacked
        onClick={currentUser ? undefined : (event: React.MouseEvent) => { event.preventDefault(); LoginDialog.open() }}
      >
        <FontAwesomeIcon icon={faPlus} />
        작품 추가
      </Link>
    );
  }
}
