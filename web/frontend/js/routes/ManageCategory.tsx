/* global confirm */
import React from 'react';
import { CurrentUserLayout } from '../layouts/CurrentUserLayout';
import { Sortable } from '../ui/Sortable';
import { CenteredFullWidth } from '../ui/Layout';
import { graphql } from '../API';
import Styles from './ManageCategory.module.less';
import { RouteComponentProps } from '../routes';
import { ManageCategoryRouteDocument, ManageCategoryRouteQuery, ManageCategory_CategoryFragment, ManageCategory_CreateCategoryDocument, ManageCategory_DeleteCategoryDocument, ManageCategory_RenameCategoryDocument, ManageCategory_UpdateCategoryOrderDocument } from './__generated__/ManageCategory.graphql';

type ManageCategoryRouteData = ManageCategoryRouteQuery & {
  currentUser: NonNullable<ManageCategoryRouteQuery['currentUser']>;
};

class CategoryItem extends React.Component<{
  isSorting: boolean;
  category: ManageCategory_CategoryFragment;
  onRename(name: string): Promise<void>;
  onRemove(): void;
}> {
  state = {
    isEditing: false,
    name: '',
  };

  render() {
    const itemClassName = this.props.isSorting
      ? Styles.sortingItem
      : Styles.item;
    if (!this.props.isSorting && this.state.isEditing)
      return (
        <div className={itemClassName}>
          <form onSubmit={this._onSubmit}>
            <input
              value={this.state.name}
              onChange={this._onChange}
              maxLength={30}
            />
            <button type="submit">변경</button>
            <span className={Styles.itemAction} onClick={this._endEditing}>
              취소
            </span>
          </form>
        </div>
      );
    else {
      var actions;
      if (!this.props.isSorting) {
        actions = [
          <span className={Styles.itemAction} onClick={this._startEditing}>
            이름 바꾸기
          </span>,
          <span className={Styles.itemAction} onClick={this.props.onRemove}>
            삭제
          </span>,
        ];
      }
      return (
        <div className={itemClassName}>
          <span className={Styles.itemName}>{this.props.category.name}</span>
          {actions}
        </div>
      );
    }
  }

  _onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ name: event.target.value });
  };

  _startEditing = () => {
    this.setState({ isEditing: true, name: this.props.category.name });
  };

  _endEditing = () => {
    this.setState({ isEditing: false });
  };

  _onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    this.props.onRename(this.state.name).then(() => this._endEditing());
  };
}

class ManageCategory extends React.Component<RouteComponentProps<ManageCategoryRouteData>> {
  nameInput = React.createRef<HTMLInputElement>();
  state: {
    sortingCategories: ManageCategory_CategoryFragment[] | null;
  } = {
    sortingCategories: null,
  };

  render() {
    const isSorting = this.state.sortingCategories != null;

    return (
      <CenteredFullWidth>
        <div className={Styles.title}>분류 관리</div>
        {isSorting ? (
          <Sortable onSwap={this._onSwap}>
            {this.state.sortingCategories!.map(this._renderItem)}
          </Sortable>
        ) : (
          this.props.data.currentUser.categories.map(this._renderItem)
        )}

        <div className={Styles.sort}>
          {isSorting ? (
            <div>
              항목을 드래그하여 순서를 바꿀 수 있습니다.{' '}
              <button className={Styles.button} onClick={this._endSorting}>
                저장
              </button>
            </div>
          ) : (
            <button className={Styles.button} onClick={this._beginSorting}>
              순서 바꾸기
            </button>
          )}
        </div>

        {!isSorting && (
          <div>
            <div className={Styles.title}>분류 추가</div>
            <form onSubmit={this._addCategory}>
              분류 이름: <input size={12} ref={this.nameInput} maxLength={30} />
              <button className={Styles.button}>추가</button>
            </form>
          </div>
        )}
      </CenteredFullWidth>
    );
  }

  _renderItem = (category: ManageCategory_CategoryFragment) => {
    const isSorting = this.state.sortingCategories != null;
    return (
      <CategoryItem
        key={category.databaseId}
        category={category}
        isSorting={isSorting}
        onRemove={() => this._removeCategory(category)}
        onRename={name => this._renameCategory(category, name)}
      />
    );
  };

  _beginSorting = () => {
    this.setState({ sortingCategories: this.props.data.currentUser.categories });
  };

  _endSorting = () => {
    const categoryIds = this.state.sortingCategories!.map(c => c.databaseId);
    graphql(ManageCategory_UpdateCategoryOrderDocument, {input: {categoryIds}}).then(
      result => {
        this.setState({ sortingCategories: null });
        this.props.writeData(data => {
          data.currentUser.categories = result.updateCategoryOrder.categories;
        });
      }
    );
  };

  _onSwap = (i: number, j: number) => {
    const nextList = this.state.sortingCategories!.slice();
    var temp = nextList[i];
    nextList[i] = nextList[j];
    nextList[j] = temp;
    this.setState({ sortingCategories: nextList });
  };

  _addCategory = (event: React.FormEvent) => {
    event.preventDefault();
    var input = this.nameInput.current!;
    graphql(ManageCategory_CreateCategoryDocument, {input: {name: input.value}}).then(result => {
      input.value = '';
      this.props.writeData(data => {
        data.currentUser.categories.push(result.createCategory.category);
      });
    });
  };

  _removeCategory = (category: ManageCategory_CategoryFragment) => {
    if (
      confirm(
        '분류를 삭제해도 기록은 삭제되지 않습니다.\n분류를 삭제하시려면 [확인]을 누르세요.'
      )
    ) {
      graphql(ManageCategory_DeleteCategoryDocument, {input: {categoryId: category.databaseId}}).then(() => {
        this.props.writeData(data => {
          data.currentUser.categories = data.currentUser.categories.filter(c => c.databaseId !== category.databaseId);
        });
      });
    }
  };

  _renameCategory = (category: ManageCategory_CategoryFragment, name: string) => {
    return graphql(ManageCategory_RenameCategoryDocument, {input: {categoryId: category.databaseId, name}}).then(() => {
      this.props.writeData(() => {
        category.name = name;
      });
    });
  };
}

const routeHandler = CurrentUserLayout.wrap({
  component: ManageCategory,

  async load({ loader }) {
    const {currentUser, ...data} = await loader.graphql(ManageCategoryRouteDocument);
    // TODO: redirect to login page
    if (!currentUser) {
      throw new Error('Login required.');
    }
    return {
      ...data,
      currentUser,
    };
  },
});
export default routeHandler;
