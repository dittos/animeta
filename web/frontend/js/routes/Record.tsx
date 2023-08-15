/* global confirm */
import * as React from 'react';
import { Modal } from 'react-overlays';
import { Link } from 'nuri';
import * as util from '../util';
import { TimeAgo } from '../ui/TimeAgo';
import { PostComposer, PostComposerResult } from '../ui/PostComposer';
import * as Typeahead from '../ui/Typeahead';
import PostComment from '../ui/GqlPostComment';
import Styles from '../ui/RecordDetail.module.less';
import connectTwitter from '../connectTwitter';
import { User } from '../layouts';
import { CenteredFullWidth } from '../ui/Layout';
import ModalStyles from '../ui/Modal.less';
import { trackEvent } from '../Tracking';
import { setLastPublishTwitter } from '../Prefs';
import { RouteComponentProps, RouteHandler } from '../routes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faMicrophoneSlash } from '@fortawesome/free-solid-svg-icons';
import { Rating } from '../ui/Rating';
import { RecordRouteDocument, RecordRouteQuery, RecordRoute_CreatePostDocument, RecordRoute_DeletePostDocument, RecordRoute_DeleteRecordDocument, RecordRoute_HeaderFragment, RecordRoute_Header_CategoryFragment, RecordRoute_PostFragment, RecordRoute_PostsDocument, RecordRoute_RecordFragment, RecordRoute_UpdateCategoryDocument, RecordRoute_UpdateRatingDocument, RecordRoute_UpdateTitleDocument } from './__generated__/Record.graphql';
import { UserLayoutPropsData } from '../ui/UserLayout';

type RecordRouteData = UserLayoutPropsData & RecordRouteQuery & {
  record: NonNullable<RecordRouteQuery['record']>;
};

type TitleEditViewProps = {
  originalTitle: string;
  onSave(newTitle: string): void;
  onCancel(): void;
};

class TitleEditView extends React.Component<TitleEditViewProps> {
  titleInput = React.createRef<HTMLInputElement>();

  async componentDidMount() {
    var typeahead = await Typeahead.initSuggest(this.titleInput.current!);
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
  selectedId: string | null;
  categoryList: RecordRoute_Header_CategoryFragment[];
  onChange(categoryId: string): void;
};

class CategoryEditView extends React.Component<CategoryEditViewProps> {
  render() {
    var name = '지정 안함';
    if (this.props.selectedId) {
      name = this.props.categoryList.filter(
        category => category.databaseId == this.props.selectedId
      )[0].name;
    }
    return (
      <span className={Styles.categoryForm}>
        <label>분류: </label>
        {name} <FontAwesomeIcon icon={faCaretDown} />
        <select value={this.props.selectedId ?? ''} onChange={this._onChange}>
          <option value="">지정 안함</option>
          {this.props.categoryList.map(category => (
            <option value={category.databaseId}>{category.name}</option>
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
  record: RecordRoute_HeaderFragment;
  onCategoryChange(categoryId: string): void;
  onTitleChange(title: string): Promise<void>;
  onRatingChange(rating: number | null): Promise<void>;
  onDelete(): void;
};

class HeaderView extends React.Component<HeaderViewProps> {
  state = {
    isEditingTitle: false,
    isSavingRating: false,
  };

  render() {
    const { record } = this.props;
    const canEdit = record.user?.isCurrentUser ?? false;

    var title = (
      <h1 className={Styles.title}>
        <Link to={util.getWorkURL(record.title!)}>
          {record.title}
        </Link>
      </h1>
    );

    if (!canEdit) {
      return (
        <div className={Styles.header}>
          {title}
          {this.props.record.rating && (
            <div className={Styles.readOnlyRating}>
              <Rating value={this.props.record.rating} readOnly={true} />
            </div>
          )}
          <div style={{ clear: 'both' }} />
        </div>
      );
    }

    var titleEditor, editTitleButton;
    if (this.state.isEditingTitle) {
      titleEditor = (
        <TitleEditView
          originalTitle={record.title!}
          onSave={this._onTitleSave}
          onCancel={() => this.setState({ isEditingTitle: false })}
        />
      );
    } else {
      editTitleButton = (
        <a
          href="#"
          className={Styles.editTitleButton}
          onClick={this._onTitleEditButtonClick}
        >
          제목 수정
        </a>
      );
    }

    var toolbar = (
      <div className={Styles.toolbar}>
        <span className={Styles.ratingForm}>
          <Rating
            defaultValue={this.props.record.rating ?? undefined}
            onChange={this._updateRating}
            disabled={this.state.isSavingRating}
          />
        </span>
        {editTitleButton}
        <a href="#" className={Styles.deleteButton} onClick={this._onDelete}>
          삭제
        </a>
        <CategoryEditView
          categoryList={record.user?.categories ?? []}
          selectedId={record.category?.databaseId ?? null}
          onChange={this.props.onCategoryChange}
        />
      </div>
    );

    return (
      <div className={Styles.header}>
        {titleEditor || title}
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

  _updateRating = async (event: React.ChangeEvent, newRating: number | null) => {
    this.setState({
      isSavingRating: true,
    })
    try {
      await this.props.onRatingChange(newRating)
    } finally {
      this.setState({
        isSavingRating: false,
      })
    }
  }
}

function PostView({ post, canEdit, canDelete, onDelete }: {
  post: RecordRoute_PostFragment;
  canEdit: boolean;
  canDelete: boolean;
  onDelete(): void;
}) {
  return (
    <div className={`${Styles.post} ${post.comment ? '' : Styles.noComment}`}>
      <div className={Styles.postProgress}>{util.getStatusTextGql(post)}</div>
      <PostComment post={post} className={Styles.postComment} showSpoiler={canEdit} />
      <div className={Styles.postMeta}>
        {post.containsSpoiler && (
          <span className={Styles.spoilerMark}>
            <FontAwesomeIcon icon={faMicrophoneSlash} size="sm" />
          </span>
        )}
        <Link to={util.getPostURLGql(post)} className={Styles.postTime}>
          {post.updatedAt ? <TimeAgo time={new Date(post.updatedAt)} /> : '#'}
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
  record: RecordRoute_RecordFragment;
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
  return <RecordBase key={props.data.record.databaseId} {...props} />;
}

class RecordBase extends React.Component<RouteComponentProps<RecordRouteData>> {
  state = {
    posts: [] as RecordRoute_PostFragment[],
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
    props.loader.graphql(RecordRoute_PostsDocument, {recordId: props.data.record.databaseId}).then(data => {
      this.setState({
        posts: data.record?.posts.nodes ?? [],
      });
    });
  };

  render() {
    const { record } = this.props.data;
    const { posts } = this.state;
    const canEdit = record.user?.isCurrentUser ?? false;
    const canDeletePosts = canEdit && posts.length > 1;
    return (
      <CenteredFullWidth>
        <HeaderView
          key={'header' + record.databaseId}
          record={record}
          onTitleChange={this._updateTitle}
          onCategoryChange={this._updateCategory}
          onRatingChange={this._updateRating}
          onDelete={() => this.setState({ showDeleteModal: true })}
        />
        {canEdit && (
          <div className={Styles.postComposerContainer}>
            <PostComposer
              key={`post-composer${record.databaseId}/${record.updatedAt}`}
              record={record}
              onSave={this._createPost}
              onTwitterConnect={this._connectTwitter}
            />
          </div>
        )}
        <div className={Styles.posts}>
          {posts.map(post => (
            <PostView
              key={post.databaseId}
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
    return this.props.loader.graphql(RecordRoute_UpdateTitleDocument, {
      input: {
        recordId: this.props.data.record.databaseId,
        title
      }
    }).then((result) => {
      this.props.writeData(data => {
        data.record = result.updateRecordTitle.record;
      });
    });
  };

  _updateCategory = (categoryID: string) => {
    return this.props.loader.graphql(RecordRoute_UpdateCategoryDocument, {
      input: {
        recordId: this.props.data.record.databaseId,
        categoryId: categoryID !== '' ? categoryID : null,
      }
    }).then(
      result => {
        this.props.writeData(data => {
          data.record = result.updateRecordCategoryId.record;
        });
      }
    );
  };

  _updateRating = (rating: number | null) => {
    return this.props.loader.graphql(RecordRoute_UpdateRatingDocument, {
      input: {
        recordId: this.props.data.record.databaseId,
        rating,
      }
    }).then(
      result => {
        this.props.writeData(data => {
          data.record = result.updateRecordRating.record;
        });
      }
    )
  }

  _deleteRecord = () => {
    this.props.loader.graphql(RecordRoute_DeleteRecordDocument, {
      input: {recordId: this.props.data.record.databaseId}
    }).then(() => {
      this._redirectToUser();
    });
  };

  _deletePost = (post: { databaseId: string }) => {
    if (
      confirm(
        '삭제 후에는 복구할 수 없습니다.\n기록을 정말로 삭제하시겠습니까?'
      )
    ) {
      this.props.loader.graphql(RecordRoute_DeletePostDocument, {
        input: {
          postId: post.databaseId,
        }
      }).then(result => {
        this.loadPosts(this.props);
        this.props.writeData(data => {
          data.record = result.deletePost.record!;
          data.user = result.deletePost.record!.user!;
        });
      });
    }
  };

  _createPost = (post: PostComposerResult) => {
    setLastPublishTwitter(post.publishTwitter);
    return this.props.loader.graphql(RecordRoute_CreatePostDocument, {
      input: {
        recordId: this.props.data.record.databaseId,
        ...post,
        rating: null,
      }
    }).then(() => {
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
        data.currentUser!.isTwitterConnected = true;
      });
    });
  };

  _redirectToUser = () => {
    const basePath = `/users/${encodeURIComponent(this.props.data.record.user!.name!)}/`;
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
    const data = await loader.graphql(RecordRouteDocument, { recordId });
    if (!data.record) {
      // TODO: 404
    }
    return {
      ...data,
      record: data.record!,
      user: data.record!.user!, // for layout
    };
  },

  renderTitle({ user, record }) {
    return `${user.name} 사용자 > ${record.title}`;
  },
};
export default routeHandler;
