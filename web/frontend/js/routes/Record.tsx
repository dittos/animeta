/* global confirm */
import * as React from 'react';
import cx from 'classnames';
import { Modal } from 'react-overlays';
import { Link } from 'nuri';
import * as util from '../util';
import { TimeAgo } from '../ui/TimeAgo';
import { PostComposer, PostComposerResult } from '../ui/PostComposer';
import * as Typeahead from '../ui/Typeahead';
import PostComment from '../ui/PostComment';
import Styles from '../ui/RecordDetail.module.less';
import {
  getRecordPosts,
  updateRecordTitle,
  updateRecordCategoryID,
  deleteRecord,
  deletePost,
  createPost,
} from '../API';
import connectTwitter from '../connectTwitter';
import { User } from '../layouts';
import { CenteredFullWidth } from '../ui/Layout';
import ModalStyles from '../ui/Modal.less';
import { trackEvent } from '../Tracking';
import { setLastPublishTwitter } from '../Prefs';
import { RouteComponentProps, RouteHandler } from '../routes';
import { CategoryDTO, PostDTO, RecordDTO, UserDTO } from '../../../shared/types_generated';
import { RecordFetchOptions } from '../../../shared/types';

type RecordRouteData = {
  currentUser: UserDTO | null;
  user: UserDTO;
  record: RecordDTO;
};

const recordFetchOptions: RecordFetchOptions = {
  user: {
    stats: true,
  },
};

type TitleEditViewProps = {
  originalTitle: string;
  onSave(newTitle: string): void;
  onCancel(): void;
};

class TitleEditView extends React.Component<TitleEditViewProps> {
  titleInput = React.createRef<HTMLInputElement>();

  componentDidMount() {
    var typeahead = Typeahead.initSuggest(this.titleInput.current!);
    typeahead.on('keypress', (event: KeyboardEvent) => {
      if (event.keyCode == 13) {
        this._onSave();
      }
    });
  }

  render() {
    return (
      <div className={Styles.titleForm}>
        <input ref={this.titleInput} defaultValue={this.props.originalTitle} />
        <button onClick={this._onSave}>저장</button>{' '}
        <a href="#" onClick={this._onCancel}>
          취소
        </a>
      </div>
    );
  }

  _onSave = () => {
    this.props.onSave(this.titleInput.current!.value);
  };

  _onCancel = (event: React.MouseEvent) => {
    event.preventDefault();
    this.props.onCancel();
  };
}

type CategoryEditViewProps = {
  selectedId: number | null;
  categoryList: CategoryDTO[];
  onChange(categoryId: string): void;
};

class CategoryEditView extends React.Component<CategoryEditViewProps> {
  render() {
    var name = '지정 안함';
    if (this.props.selectedId) {
      name = this.props.categoryList.filter(
        category => category.id == this.props.selectedId
      )[0].name;
    }
    return (
      <span className={Styles.categoryForm}>
        <label>분류: </label>
        {name} <i className="fa fa-caret-down" />
        <select value={String(this.props.selectedId)} onChange={this._onChange}>
          <option value="">지정 안함</option>
          {this.props.categoryList.map(category => (
            <option value={String(category.id)}>{category.name}</option>
          ))}
        </select>
      </span>
    );
  }

  _onChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    var categoryId = event.target.value;
    this.props.onChange(categoryId);
  };
}

type HeaderViewProps = {
  record: RecordDTO;
  currentUser: UserDTO | null;
  onCategoryChange(categoryId: string): void;
  onTitleChange(title: string): Promise<void>;
  onDelete(): void;
};

class HeaderView extends React.Component<HeaderViewProps> {
  state = { isEditingTitle: false };

  render() {
    const { record, currentUser } = this.props;
    const canEdit = currentUser && currentUser.id === record.user!.id;

    var titleEditor, editTitleButton;
    if (this.state.isEditingTitle) {
      titleEditor = (
        <TitleEditView
          originalTitle={record.title}
          onSave={this._onTitleSave}
          onCancel={() => this.setState({ isEditingTitle: false })}
        />
      );
    } else {
      titleEditor = (
        <h1 className={Styles.title}>
          <Link to={util.getWorkURL(record.title)}>{record.title}</Link>
        </h1>
      );
      editTitleButton = (
        <a
          href="#"
          className={Styles.toolbarButton}
          onClick={this._onTitleEditButtonClick}
        >
          제목 수정
        </a>
      );
    }
    var toolbar;
    if (canEdit) {
      toolbar = (
        <div className={Styles.toolbar}>
          {editTitleButton}
          <a href="#" className={Styles.deleteButton} onClick={this._onDelete}>
            삭제
          </a>
          <CategoryEditView
            categoryList={currentUser?.categories || []}
            selectedId={record.category_id}
            onChange={this.props.onCategoryChange}
          />
        </div>
      );
    }

    return (
      <div className={Styles.header}>
        {titleEditor}
        {toolbar}
        <div style={{ clear: 'both' }} />
      </div>
    );
  }

  _onTitleEditButtonClick = (event: React.MouseEvent) => {
    event.preventDefault();
    this.setState({ isEditingTitle: true });
  };

  _onTitleSave = (title: string) => {
    this.props.onTitleChange(title).then(() => {
      this.setState({ isEditingTitle: false });
    });
  };

  _onDelete = (event: React.MouseEvent) => {
    event.preventDefault();
    this.props.onDelete();
  };
}

function PostView({ post, canEdit, canDelete, onDelete }: {
  post: PostDTO;
  canEdit: boolean;
  canDelete: boolean;
  onDelete(): void;
}) {
  return (
    <div className={`${Styles.post} ${post.comment ? '' : Styles.noComment}`}>
      <div className={Styles.postProgress}>{util.getStatusText(post)}</div>
      <PostComment post={post} className={Styles.postComment} showSpoiler={canEdit} />
      <div className={Styles.postMeta}>
        {post.contains_spoiler && (
          <span className={Styles.spoilerMark}>
            <i className="fa fa-microphone-slash" />
          </span>
        )}
        <Link to={util.getPostURL(post)} className={Styles.postTime}>
          {post.updated_at ? <TimeAgo time={new Date(post.updated_at)} /> : '#'}
        </Link>
        {canDelete && (
          <span className={Styles.deletePostButton} onClick={onDelete}>
            지우기
          </span>
        )}
      </div>
    </div>
  );
}

function DeleteRecordModal({ record, onConfirm, onCancel }: {
  record: RecordDTO;
  onConfirm(): void;
  onCancel(): void;
}) {
  return (
    <Modal
      show={true}
      className={ModalStyles.container}
      renderBackdrop={(props) => <div className={ModalStyles.backdrop} {...props} />}
      onHide={onCancel}
    >
      <div className={ModalStyles.dialog}>
        <div className={ModalStyles.header}>
          <h2 className={ModalStyles.title}>기록 삭제</h2>
        </div>
        <p>'{record.title}'에 대한 기록을 모두 삭제합니다. </p>
        <p>
          주의: <strong>일단 삭제하면 되돌릴 수 없으니</strong> 신중하게
          생각하세요.
        </p>
        <button className={ModalStyles.cancelButton} onClick={onCancel}>
          취소
        </button>
        <button className={ModalStyles.dangerConfirmButton} onClick={onConfirm}>
          삭제
        </button>
      </div>
    </Modal>
  );
}

function Record(props: RouteComponentProps<RecordRouteData>) {
  return <RecordBase key={props.data.record.id} {...props} />;
}

class RecordBase extends React.Component<RouteComponentProps<RecordRouteData>> {
  state = {
    posts: [] as PostDTO[],
    showDeleteModal: false,
  };

  componentDidMount() {
    this.loadPosts(this.props);
  }

  loadPosts = (props: RouteComponentProps<RecordRouteData>) => {
    this.setState({
      posts: [],
      showDeleteModal: false,
    });
    getRecordPosts(props.data.record.id).then(data => {
      this.setState({
        posts: data.posts,
      });
    });
  };

  render() {
    const { record, currentUser } = this.props.data;
    const { posts } = this.state;
    const canEdit = currentUser ? currentUser.id === record.user?.id : false;
    const canDeletePosts = canEdit && posts.length > 1;
    return (
      <CenteredFullWidth>
        <HeaderView
          key={'header' + record.id}
          record={record}
          currentUser={currentUser}
          onTitleChange={this._updateTitle}
          onCategoryChange={this._updateCategory}
          onDelete={() => this.setState({ showDeleteModal: true })}
        />
        {canEdit && (
          <div className={Styles.postComposerContainer}>
            <PostComposer
              key={'post-composer' + record.id + '/' + record.updated_at}
              record={record}
              currentUser={currentUser!}
              onSave={this._createPost}
              onTwitterConnect={this._connectTwitter}
            />
          </div>
        )}
        <div className={Styles.posts}>
          {posts.map(post => (
            <PostView
              key={post.id}
              post={post}
              canEdit={canEdit}
              canDelete={canDeletePosts}
              onDelete={() => this._deletePost(post)}
            />
          ))}
        </div>

        {this.state.showDeleteModal && (
          <DeleteRecordModal
            record={record}
            onConfirm={this._deleteRecord}
            onCancel={() => this.setState({ showDeleteModal: false })}
          />
        )}
      </CenteredFullWidth>
    );
  }

  _updateTitle = (title: string) => {
    return updateRecordTitle(this.props.data.record.id, title, recordFetchOptions).then(result => {
      this.props.writeData(data => {
        data.record = result.record;
      });
    });
  };

  _updateCategory = (categoryID: string) => {
    return updateRecordCategoryID(this.props.data.record.id, categoryID !== '' ? Number(categoryID) : null, recordFetchOptions).then(
      result => {
        this.props.writeData(data => {
          data.record = result.record;
        });
      }
    );
  };

  _deleteRecord = () => {
    deleteRecord(this.props.data.record.id).then(() => {
      this._redirectToUser();
    });
  };

  _deletePost = (post: PostDTO) => {
    if (
      confirm(
        '삭제 후에는 복구할 수 없습니다.\n기록을 정말로 삭제하시겠습니까?'
      )
    ) {
      deletePost(post.id, recordFetchOptions).then(result => {
        this.loadPosts(this.props);
        this.props.writeData(data => {
          data.record = result.record!;
          data.user = result.record!.user!;
        });
      });
    }
  };

  _createPost = (post: PostComposerResult) => {
    setLastPublishTwitter(post.publishTwitter);
    return createPost(this.props.data.record.id, post).then(() => {
      trackEvent({
        eventCategory: 'Post',
        eventAction: 'Create',
        eventLabel: post.comment ? (post.containsSpoiler ? 'Spoiler' : 'NoSpoiler') : 'NoComment',
      });
      if (post.publishTwitter) {
        trackEvent({
          eventCategory: 'Post',
          eventAction: 'ShareOnTwitter',
        });
      }
      this._redirectToUser();
    });
  };

  _connectTwitter = () => {
    return connectTwitter().then(() => {
      this.props.writeData(data => {
        data.currentUser!.is_twitter_connected = true;
      });
    });
  };

  _redirectToUser = () => {
    const basePath = `/users/${encodeURIComponent(this.props.data.user.name)}/`;
    this.props.controller!.load({
      path: basePath,
      query: {},
    });
  };
}

const routeHandler: RouteHandler<RecordRouteData> = {
  component: User(Record),

  async load({ loader, params }) {
    const { recordId } = params;
    const [currentUser, record] = await Promise.all([
      loader.getCurrentUser({
        options: {
          categories: true,
          twitter: true,
        },
      }),
      loader.callV4(`/records/${recordId}`, {
        options: recordFetchOptions,
      }),
    ]);
    return {
      currentUser,
      user: record.user,
      record,
    };
  },

  renderTitle({ user, record }) {
    return `${user.name} 사용자 > ${record.title}`;
  },
};
export default routeHandler;
