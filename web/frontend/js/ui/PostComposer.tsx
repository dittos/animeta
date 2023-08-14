import * as React from 'react';
import * as util from '../util';
import { StatusInput } from './StatusInput';
import Styles from './PostComposer.less';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWarning } from '@fortawesome/free-solid-svg-icons';
import { PostComposer_RecordFragment } from './__generated__/PostComposer.graphql';
import { StatusType } from '../__generated__/globalTypes';

export type PostComposerProps = {
  record: PostComposer_RecordFragment;
  onTwitterConnect(): Promise<void>;
  onSave(result: PostComposerResult): Promise<any>;
};

export type PostComposerResult = {
  status: string;
  statusType: StatusType;
  comment: string;
  containsSpoiler: boolean;
  publishTwitter: boolean;
};

const PUBLISH_TWITTER_DISABLED_MESSAGE = "트위터 API 유료화로 공유 기능 제공을 중단합니다.";

export class PostComposer extends React.Component<PostComposerProps> {
  private _submitting: boolean;

  state = {
    statusType: this.props.record.statusType ?? StatusType.Finished,
    status: util.plusOne(this.props.record.status ?? ''),
    comment: '',
    publishTwitter: false,
    containsSpoiler: false,
  };

  render() {
    const { record } = this.props;
    var currentStatus;
    if (record.status) {
      currentStatus = (
        <span className={Styles.currentProgress}>{record.status} &rarr; </span>
      );
    }
    return (
      <form className={Styles.postComposer}>
        <div className={Styles.progress}>
          <select
            name="statusType"
            value={this.state.statusType}
            onChange={this._commonOnChange}
          >
            <option value={StatusType.Watching}>보는 중</option>
            <option value={StatusType.Finished}>완료</option>
            <option value={StatusType.Suspended}>중단</option>
            <option value={StatusType.Interested}>볼 예정</option>
          </select>
          {' @ '}
          {currentStatus}
          <StatusInput
            value={this.state.status}
            onChange={this._onStatusChange}
          />
        </div>
        <textarea
          name="comment"
          rows={3}
          cols={30}
          autoFocus
          placeholder="감상평 (선택사항)"
          value={this.state.comment}
          onChange={this._commonOnChange}
        />
        <div className={Styles.actions}>
          <label>
            <input
              type="checkbox"
              checked={this.state.containsSpoiler}
              onChange={this._onContainsSpoilerChange}
            />
            {' 내용 누설 포함'}
          </label>
          <label
            className={Styles.disabledLabel}
            title={PUBLISH_TWITTER_DISABLED_MESSAGE}
            onClick={e => alert(PUBLISH_TWITTER_DISABLED_MESSAGE)}
          >
            <input
              type="checkbox"
              disabled
            />
            {' 트위터에 공유'}
            <FontAwesomeIcon icon={faWarning} />
          </label>
          <button type="button" onClick={this._onSubmit}>
            기록 추가
          </button>
        </div>
      </form>
    );
  }

  _commonOnChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  _onStatusChange = (newValue: string) => {
    this.setState({ status: newValue });
  };

  _onContainsSpoilerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ containsSpoiler: event.target.checked });
  };

  _onSubmit = (event: React.MouseEvent) => {
    event.preventDefault();
    if (this._submitting) return;
    this._submitting = true;
    const {
      status,
      statusType,
      comment,
      containsSpoiler,
      publishTwitter,
    } = this.state;
    this.props.onSave({
      status,
      statusType,
      comment,
      containsSpoiler,
      publishTwitter,
    }).then(() => this._submitting = false, () => this._submitting = false);
  };
}
