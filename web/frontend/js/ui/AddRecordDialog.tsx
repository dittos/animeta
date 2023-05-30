import React from 'react';
import { Modal } from 'react-overlays';
import { getCurrentUser, graphql } from '../API';
import connectTwitter from '../connectTwitter';
import * as Typeahead from './Typeahead';
import { Switch, SwitchItem } from './Switch';
import LoginDialog from './LoginDialog';
import { StatusInput } from './StatusInput';
import ModalStyles from './Modal.less';
import Styles from './AddRecordDialog.less';
import { getLastPublishTwitter, setLastPublishTwitter } from '../Prefs';
import { CategoryDTO, UserDTO, StatusType } from '../../../shared/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle, faWarning } from '@fortawesome/free-solid-svg-icons';
import { Rating } from './Rating';
import { CreateRecordInput, StatusType as GqlStatusType } from '../__generated__/globalTypes';
import { TypedDocumentNode } from '@graphql-typed-document-node/core';

type CategorySelectProps = {
  selectedId: string;
  categoryList: CategoryDTO[];
  onChange(selectedId: string): any;
};

class CategorySelect extends React.Component<CategorySelectProps> {
  render() {
    const { selectedId, categoryList, ...props } = this.props;
    return (
      <select {...props} value={selectedId} onChange={this._onChange}>
        <option value="">지정 안함</option>
        {categoryList.map(category => (
          <option value={category.id}>{category.name}</option>
        ))}
      </select>
    );
  }

  _onChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (this.props.onChange) this.props.onChange(event.target.value);
  };
}

type AbstractCreateRecordMutationDocument<T> = TypedDocumentNode<{
  createRecord: T
}, {
  input: CreateRecordInput
}>
type AddRecordProps<T> = {
  initialTitle?: string;
  initialStatusType?: StatusType;
  currentUser?: UserDTO;
  createRecordMutation: AbstractCreateRecordMutationDocument<T>;
  onCreate(result: T): any;
  onCancel(): any;
};
type AddRecordState = {
  selectedCategoryId: string;
  statusType: StatusType;
  status: string;
  comment: string;
  rating: number | null;
  publishTwitter: boolean;
  isRequesting: boolean;
  currentUser: UserDTO | null;
};

const PUBLISH_TWITTER_DISABLED_MESSAGE = "트위터 API 유료화로 공유 기능 제공을 중단합니다.";

class AddRecord<T> extends React.Component<AddRecordProps<T>, AddRecordState> {
  private _titleEl: HTMLInputElement | null = null;

  constructor(props: AddRecordProps<T>) {
    super(props);
    this.state = {
      selectedCategoryId: '',
      statusType: props.initialStatusType || 'WATCHING',
      status: '',
      comment: '',
      rating: null,
      publishTwitter: false,
      isRequesting: false,
      currentUser: null,
    };
  }

  render() {
    const currentUser = this.state.currentUser;
    if (!currentUser) {
      return null;
    }
    const onCancel = this.props.onCancel;
    return (
      <Modal
        show={true}
        className={ModalStyles.container}
        renderBackdrop={(props: any) => <div className={ModalStyles.backdrop} {...props} />}
      >
        <div className={ModalStyles.dialog} style={{ overflow: 'visible' }}>
          <div className={ModalStyles.header}>
            <button className={ModalStyles.closeButton} onClick={onCancel}>
              <FontAwesomeIcon icon={faTimesCircle} size="lg" />
            </button>
            <h2 className={ModalStyles.title}>작품 추가</h2>
          </div>
          <form className={Styles.form} onSubmit={this._onSubmit}>
            <div className={Styles.field}>
              <label>작품명</label>
              <input ref={el => this._titleEl = el} defaultValue={this.props.initialTitle} />
            </div>
            <div className={Styles.field}>
              <label>감상 상태</label>
              <Switch
                flex={true}
                value={this.state.statusType}
                onChange={this._onStatusTypeChange}
              >
                <SwitchItem value="INTERESTED">볼 예정</SwitchItem>
                <SwitchItem value="WATCHING">보는 중</SwitchItem>
                <SwitchItem value="FINISHED">완료</SwitchItem>
                <SwitchItem value="SUSPENDED">중단</SwitchItem>
              </Switch>
            </div>
            {this.state.statusType !== 'INTERESTED' && (
              <>
                <div className={Styles.field}>
                  <label>진행률 (선택 사항)</label>
                  <StatusInput
                    value={this.state.status}
                    onChange={this._onStatusChange}
                  />
                </div>
                <div className={Styles.field}>
                  <label>별점</label>
                  <Rating
                    value={this.state.rating ?? undefined}
                    onChange={this._onRatingChange}
                  />
                </div>
              </>
            )}
            <div className={Styles.field}>
              <label>분류</label>
              <CategorySelect
                categoryList={currentUser.categories!}
                selectedId={this.state.selectedCategoryId}
                onChange={this._onCategoryChange}
              />
            </div>
            <div className={Styles.field}>
              <label>감상평 (선택 사항)</label>
              <textarea
                value={this.state.comment}
                onChange={this._onCommentChange}
              />
            </div>
          </form>
          <div className={Styles.shareOptions}>
            <label
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
          </div>
          <button
            className={ModalStyles.confirmButton}
            disabled={this.state.isRequesting}
            onClick={this._onSubmit}
          >
            추가
          </button>
          <div style={{ clear: 'both' }} />
        </div>
      </Modal>
    );
  }

  componentDidMount() {
    this._load();
  }

  _onRatingChange = (event: any, rating: number | null) => {
    this.setState({ rating });
  };

  _onCategoryChange = (categoryId: string) => {
    this.setState({ selectedCategoryId: categoryId });
  };

  _onStatusTypeChange = (statusType: StatusType) => {
    const status = statusType === 'INTERESTED' ? '' : this.state.status;
    const rating = statusType === 'INTERESTED' ? null : this.state.rating;
    this.setState({
      statusType,
      status,
      rating,
    });
  };

  _onStatusChange = (status: string) => {
    this.setState({ status });
  };

  _onCommentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    this.setState({ comment: event.target.value });
  };

  _onPublishTwitterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!this.state.currentUser!.is_twitter_connected) {
      connectTwitter().then(() => {
        this.setState((state: AddRecordState) => ({
          publishTwitter: true,
          currentUser: { ...state.currentUser!, is_twitter_connected: true },
        }));
      });
    } else {
      this.setState({ publishTwitter: event.target.checked });
    }
  };

  _onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (this.state.isRequesting) return;
    this.setState({ isRequesting: true });
    setLastPublishTwitter(this.state.publishTwitter);
    graphql(this.props.createRecordMutation, {input: {
      title: this._titleEl!.value,
      statusType: this.state.statusType as GqlStatusType,
      status: this.state.status,
      categoryId: this.state.selectedCategoryId !== '' ? this.state.selectedCategoryId : null,
      comment: this.state.comment,
      rating: this.state.rating,
      publishTwitter: this.state.publishTwitter,
    }})
    // createRecord({
    //   title: this._titleEl!.value,
    //   statusType: this.state.statusType,
    //   status: this.state.status,
    //   categoryId: this.state.selectedCategoryId !== '' ? Number(this.state.selectedCategoryId) : null,
    //   comment: this.state.comment,
    //   rating: this.state.rating,
    //   publishTwitter: this.state.publishTwitter,
    // })
      .then(result => {
        this.props.onCreate(result.createRecord);
        this.setState({ isRequesting: false });
      }, () => {
        this.setState({ isRequesting: false });
      });
  };

  async _load() {
    // TODO: cache
    const currentUser = await getCurrentUser({
      options: {
        categories: true,
        twitter: true,
      },
    });
    if (!currentUser) {
      alert('로그인 후 추가할 수 있습니다.');
      LoginDialog.open();
      this.props.onCancel();
      return;
    }
    this.setState({ currentUser }, () => {
      // FIXME
      setTimeout(() => {
        if (this._titleEl) {
          Typeahead.initSuggest(this._titleEl);
          if (!this.props.initialTitle) {
            this._titleEl.focus();
          }
        }
      }, 10);
    });
  }
}

export default AddRecord;
