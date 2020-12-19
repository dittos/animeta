import React from 'react';
import { Link } from 'nuri';
import Styles from '../../less/table-period.less';
import AddRecordDialog from '../ui/AddRecordDialog';
import { trackEvent } from '../Tracking';
import * as util from '../util';
import { CreditType, RecordDTO, WorkDTO, WorkSchedule } from '../types';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function getDate(value: Date): string {
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
  item: WorkDTO;
  onAddRecord: (item: WorkDTO, record: RecordDTO) => any;
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
          to={`/records/${record.id}/`}
        >
          <i className="fa fa-pencil" />
          {util.STATUS_TYPE_TEXT[record.status_type]}
          {record.status && (
            <span className={Styles.favoriteButtonSubtext}>@ {util.getStatusDisplay(record)}</span>
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
          <i className="fa fa-plus" />
          작품 추가
        </Link>
        {this.state.showAddModal && (
          <AddRecordDialog
            initialStatusType="interested"
            initialTitle={this.props.item.title}
            onCancel={this._closeAddModal}
            onCreate={this._recordAdded}
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

  _recordAdded = (result: { record: RecordDTO }) => {
    this.setState({ showAddModal: false });
    trackEvent({
      eventCategory: 'Record',
      eventAction: 'Create',
      eventLabel: 'Table',
    });
    this.props.onAddRecord(this.props.item, result.record);
  };
}

function Poster({ item }: { item: WorkDTO }) {
  return (
    <div className={Styles.poster}>
      <img src={item.image_url} className={Styles.posterImage} />
      <div className={Styles.posterOverlay}>
        <i className="fa fa-check" /> {item.record_count}
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

export function TableItem({ item, onAddRecord }: { item: WorkDTO; onAddRecord: (item: WorkDTO, record: RecordDTO) => any }) {
  var { links, studios, source, schedule, durationMinutes } = item.metadata;
  return (
    <div className={Styles.item}>
      <Link to={util.getWorkURL(item.title)}>
        <Poster item={item} />
      </Link>
      <div className={Styles.itemContent}>
        <h3 className={Styles.title}>
          {item.metadata.title}
          {durationMinutes && <span className={Styles.duration}>{durationMinutes}분</span>}
        </h3>
        <div className={Styles.info}>
          <span className="studio">
            {studios ? studios.join(', ') : '제작사 미정'}
          </span>
          {source && <>
            {' / '}
            <span className="source">{util.SOURCE_TYPE_MAP[source]}</span>
          </>}
        </div>
        <div className={Styles.actions}>
          <StatusButton item={item} onAddRecord={onAddRecord} />
        </div>
        <div className={Styles.schedules}>
          {renderSchedule('jp', schedule.jp)}
          {schedule.kr && renderSchedule('kr', schedule.kr)}
        </div>
        <div className={Styles.credits}>
          {item.recommendations && item.recommendations.length > 0 && (
            item.recommendations.map(({ credit, related }) => (
              <div className={Styles.credit}>
                <span className={Styles.creditType}>{creditTypeText[credit.type]}</span>
                {credit.name}{' '}
                <span className={Styles.creditRelated}>({related.map(it => it.workTitle).join(', ')})</span>
              </div>
            ))
          )}
        </div>
        <div className={Styles.links}>
          {links.website && (
            <a
              href={links.website}
              className="link link-official"
              target="_blank"
            >
              공식 사이트
            </a>
          )}
          {links.namu && (
            <a href={links.namu} className="link link-namu" target="_blank">
              나무위키
            </a>
          )}
          {links.ann && (
            <a href={links.ann} className="link link-ann" target="_blank">
              ANN (en)
            </a>
          )}
        </div>
      </div>
      <div style={{ clear: 'left' }} />
    </div>
  );
}

function renderSchedule(country: string, schedule: WorkSchedule) {
  var { date, date_only = false, broadcasts } = schedule;
  const dateObject = date ? new Date(date) : null;
  return (
    <div className={Styles.schedule + ' item-schedule-' + country}>
      {dateObject ? (
        <span className="date">{getDate(dateObject)}</span>
      ) : (
        <span className="date">미정</span>
      )}
      {date &&
        !date_only && <span className="time"> {util.formatTime(dateObject)}</span>}
      {broadcasts && [
        ' ',
        <span className="broadcasts">({broadcasts.join(', ')})</span>,
      ]}
    </div>
  );
}
