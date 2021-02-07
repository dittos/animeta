import * as React from 'react';
import * as util from '../util';
import { StatusInput } from './StatusInput';
import Styles from './PostComposer.less';
import { getLastPublishTwitter } from '../Prefs';
import { RecordDTO, UserDTO } from '../../../shared/types_generated';
import { StatusType } from '../../../shared/types';

export type PostComposerProps = {
  record: RecordDTO;
  currentUser: UserDTO;
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

export class PostComposer extends React.Component<PostComposerProps> {
  private _submitting: boolean;

  state = {
    statusType: this.props.record.status_type as StatusType,
    status: util.plusOne(this.props.record.status),
    comment: '',
    publishTwitter: false,
    containsSpoiler: false,
  };

  componentDidMount() {
    this.setState({ publishTwitter: getLastPublishTwitter() });
  }

  render() {
    const { record, currentUser } = this.props;
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
            <option value="watching">보는 중</option>
            <option value="finished">완료</option>
            <option value="suspended">중단</option>
            <option value="interested">볼 예정</option>
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
          <label>
            <input
              type="checkbox"
              checked={
                currentUser.is_twitter_connected ? this.state.publishTwitter : false
              }
              onChange={this._onPublishTwitterChange}
            />
            {' 트위터에 공유'}
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

  _onPublishTwitterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!this.props.currentUser.is_twitter_connected) {
      this.props.onTwitterConnect().then(() => {
        this.setState({ publishTwitter: true });
      });
    } else {
      this.setState({ publishTwitter: event.target.checked });
    }
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
