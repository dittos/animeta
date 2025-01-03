import React from 'react';
import { Link } from 'nuri';
import Styles from '../../less/table-period.less';
import AddRecordDialog from './AddRecordDialog';
import { trackEvent } from '../Tracking';
import * as util from '../util';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faPencil, faPlus } from '@fortawesome/free-solid-svg-icons';
import { TableItem_CreateRecordDocument, TableItem_CreateRecordMutation, TableItem_ItemFragment, TableItem_Item_RecordFragment } from './__generated__/TableItem.graphql';
import { CreditType, StatusType, WorkSchedule } from '../__generated__/globalTypes';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

let DATE_FORMAT: Intl.DateTimeFormat | null = null;
try {
  DATE_FORMAT = new Intl.DateTimeFormat('ko', {
    month: '2-digit', day: '2-digit', weekday: 'short',
    timeZone: 'Asia/Seoul'
  });
} catch (e) {}

function getDate(value: Date): string {
  if (DATE_FORMAT) {
    return DATE_FORMAT.format(value).replace(/([0-9]+)\. ([0-9]+)\./, '$1/$2');
  }
  var weekday = WEEKDAYS[value.getDay()];
  return (
    util.zerofill(value.getMonth() + 1) +
    '/' +
    util.zerofill(value.getDate()) +
    ' (' +
    weekday +
    ')'
  );
}

interface StatusButtonProps {
  item: TableItem_ItemFragment;
  onAddRecord: (item: TableItem_ItemFragment, record: TableItem_Item_RecordFragment) => any;
}

class StatusButton extends React.Component<StatusButtonProps> {
  state = {
    showAddModal: false,
  };

  render() {
    var { record } = this.props.item;
    if (record) {
      return (
        <Link
          className={Styles.favoriteButtonActive}
          to={`/records/${record.databaseId}/`}
        >
          <FontAwesomeIcon icon={faPencil} />
          {record.statusType && util.GQL_STATUS_TYPE_TEXT[record.statusType]}
          {record.status && (
            <span className={Styles.favoriteButtonSubtext}>@ {util.getStatusDisplayGql(record)}</span>
          )}
        </Link>
      );
    } else {
      return (<>
        <Link
          className={Styles.favoriteButtonNormal}
          to={'/records/add/' + encodeURIComponent(this.props.item.title) + '/'}
          onClick={this._showAddModal}
        >
          <FontAwesomeIcon icon={faPlus} />
          작품 추가
        </Link>
        {this.state.showAddModal && (
          <AddRecordDialog
            initialStatusType={StatusType.Interested}
            initialTitle={this.props.item.title}
            onCancel={this._closeAddModal}
            onCreate={this._recordAdded}
            createRecordMutation={TableItem_CreateRecordDocument}
          />
        )}
      </>);
    }
  }

  _showAddModal = (event: React.MouseEvent) => {
    event.preventDefault();
    this.setState({ showAddModal: true });
  };

  _closeAddModal = () => {
    this.setState({ showAddModal: false });
  };

  _recordAdded = (result: TableItem_CreateRecordMutation['createRecord']) => {
    this.setState({ showAddModal: false });
    trackEvent({
      eventCategory: 'Record',
      eventAction: 'Create',
      eventLabel: 'Table',
    });
    this.props.onAddRecord(this.props.item, result.record);
  };
}

function Poster({ work }: { work: TableItem_ItemFragment['work'] }) {
  return (
    <div className={Styles.poster}>
      <img src={work.imageUrl!} className={Styles.posterImage} />
      <div className={Styles.posterOverlay}>
        <FontAwesomeIcon icon={faCheck} /> {work.recordCount}
      </div>
    </div>
  );
}

const creditTypeText: {[K in CreditType]: string} = {
  'ORIGINAL_WORK': '원작',
  'CHIEF_DIRECTOR': '총감독',
  'SERIES_DIRECTOR': '시리즈 감독',
  'DIRECTOR': '감독',
  'SERIES_COMPOSITION': '시리즈 구성',
  'CHARACTER_DESIGN': '캐릭터 디자인',
  'MUSIC': '음악',
};

export function TableItem({ item, onAddRecord }: {
  item: TableItem_ItemFragment
  onAddRecord: (item: TableItem_ItemFragment, record: TableItem_Item_RecordFragment) => any
}) {
  const work = item.work;
  var { studioNames, source, schedules, durationMinutes,
    websiteUrl, namuwikiUrl, translatedJaWikipediaUrl, annUrl } = work.metadata!;
  return (
    <div className={Styles.item}>
      <Link to={util.getWorkURL(work.title!)}>
        <Poster work={work} />
      </Link>
      <div className={Styles.itemContent}>
        <h3 className={Styles.title}>
          {item.title}
          {durationMinutes && <span className={Styles.duration}>{durationMinutes}분</span>}
        </h3>
        <div className={Styles.info}>
          {source && <>
            <span className="source">{util.SOURCE_TYPE_MAP[source]}</span>
            {' / '}
          </>}
          <span className="studio">
            {studioNames ? `${studioNames.join(', ')} 제작` : '제작사 미정'}
          </span>
        </div>
        <div className={Styles.actions}>
          <StatusButton item={item} onAddRecord={onAddRecord} />
        </div>
        {schedules && (
          <div className={Styles.schedules}>
            {renderSchedule('jp', schedules)}
            {renderSchedule('kr', schedules)}
          </div>
        )}
        <div className={Styles.credits}>
          {item.recommendations && item.recommendations.length > 0 && (
            item.recommendations.map(({ credit, related }) => credit && (
              <div className={Styles.credit}>
                <span className={Styles.creditType}>{creditTypeText[credit.type!]}</span>
                {credit.name}{' '}
                <span className={Styles.creditRelated}>({related && related.map(it => it.workTitle).join(', ')})</span>
              </div>
            ))
          )}
        </div>
        <div className={Styles.links}>
          {websiteUrl && (
            <a
              href={websiteUrl}
              className="link link-official"
              target="_blank"
            >
              공식 사이트
            </a>
          )}
          {namuwikiUrl && (
            <a href={namuwikiUrl} className="link link-namu" target="_blank">
              나무위키
            </a>
          )}
          {translatedJaWikipediaUrl && (
            <a
              href={translatedJaWikipediaUrl}
              className="link link-wikipedia"
              target="_blank"
            >
              위키백과 (日)
            </a>
          )}
          {annUrl && (
            <a href={annUrl} className="link link-ann" target="_blank">
              ANN (en)
            </a>
          )}
        </div>
      </div>
      <div style={{ clear: 'left' }} />
    </div>
  );
}

function renderSchedule(country: string, schedules: WorkSchedule[]) {
  const schedule = schedules.find(it => it.country === country)
  if (!schedule) return null
  var { date, datePrecision, broadcasts } = schedule;
  const dateObject = date ? new Date(date) : null;
  return (
    <div className={Styles.schedule + ' item-schedule-' + country}>
      {dateObject ? (
        <span className="date">{getDate(dateObject)}</span>
      ) : (
        <span className="date">미정</span>
      )}
      {dateObject && datePrecision === 'DATE_TIME' && (
        <span className="time"> {util.formatTime(dateObject)}</span>
      )}
      {broadcasts && [
        ' ',
        <span className="broadcasts">({broadcasts.join(', ')})</span>,
      ]}
    </div>
  );
}
