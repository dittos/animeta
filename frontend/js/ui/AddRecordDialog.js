import React from 'react';
import { Modal } from 'react-overlays';
import { getCurrentUser, createRecord } from '../API';
import * as Typeahead from './Typeahead';
import { Switch, SwitchItem } from './Switch';
import LoginDialog from './LoginDialog';
import { StatusInput } from './StatusInput';
import ModalStyles from './Modal.less';
import Styles from './AddRecordDialog.less';

class CategorySelect extends React.Component {
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

  _onChange = event => {
    if (this.props.onChange) this.props.onChange(event.target.value);
  };
}

class AddRecord extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedCategoryId: '',
      statusType: props.initialStatusType || 'watching',
      status: '',
      comment: '',
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
        backdropClassName={ModalStyles.backdrop}
      >
        <div className={ModalStyles.dialog} style={{ overflow: 'visible' }}>
          <div className={ModalStyles.header}>
            <button className={ModalStyles.closeButton} onClick={onCancel}>
              <i className="fa fa-lg fa-times-circle" />
            </button>
            <h2 className={ModalStyles.title}>작품 추가</h2>
          </div>
          <form className={Styles.form} onSubmit={this._onSubmit}>
            <div className={Styles.field}>
              <label>작품명</label>
              <input ref="title" defaultValue={this.props.initialTitle} />
            </div>
            <div className={Styles.field}>
              <label>감상 상태</label>
              <Switch
                flex={true}
                value={this.state.statusType}
                onChange={this._onStatusTypeChange}
              >
                <SwitchItem value="interested">볼 예정</SwitchItem>
                <SwitchItem value="watching">보는 중</SwitchItem>
                <SwitchItem value="finished">완료</SwitchItem>
                <SwitchItem value="suspended">중단</SwitchItem>
              </Switch>
            </div>
            {this.state.statusType !== 'interested' && (
              <div className={Styles.field}>
                <label>진행률 (선택 사항)</label>
                <StatusInput
                  value={this.state.status}
                  onChange={this._onStatusChange}
                />
              </div>
            )}
            <div className={Styles.field}>
              <label>분류</label>
              <CategorySelect
                categoryList={currentUser.categories}
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

  _onTitleChange = event => {
    this.setState({ title: event.target.value });
  };

  _onCategoryChange = categoryId => {
    this.setState({ selectedCategoryId: categoryId });
  };

  _onStatusTypeChange = statusType => {
    const status = statusType === 'interested' ? '' : this.state.status;
    this.setState({
      statusType,
      status,
    });
  };

  _onStatusChange = status => {
    this.setState({ status });
  };

  _onCommentChange = event => {
    this.setState({ comment: event.target.value });
  };

  _onSubmit = event => {
    event.preventDefault();
    if (this.state.isRequesting) return;
    this.setState({ isRequesting: true });
    const currentUser = this.state.currentUser;
    createRecord(currentUser.name, {
      title: this.refs.title.value,
      statusType: this.state.statusType,
      status: this.state.status,
      categoryID: this.state.selectedCategoryId,
      comment: this.state.comment,
    })
      .then(result => {
        this.props.onCreate(result);
      })
      .always(() => {
        this.setState({ isRequesting: false });
      });
  };

  async _load() {
    // TODO: cache
    const currentUser = await getCurrentUser({
      options: { categories: true },
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
        if (this.refs.title) {
          Typeahead.initSuggest(this.refs.title);
          if (!this.props.initialTitle) {
            this.refs.title.focus();
          }
        }
      }, 10);
    });
  }
}

export default AddRecord;
