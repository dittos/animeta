/* global confirm */
import React from 'react';
import { User } from '../layouts';
import { Sortable } from '../ui/Sortable';
import { CenteredFullWidth } from '../ui/Layout';
import {
  renameCategory,
  removeCategory,
  addCategory,
  updateCategoryOrder,
} from '../TypedAPI';
import Styles from './ManageCategory.less';
import { CategoryDTO, UserDTO } from '../types_generated';
import { RouteComponentProps, RouteHandler } from 'nuri/app';
import { UserLayoutPropsData } from '../ui/UserLayout';

type ManageCategoryRouteData = UserLayoutPropsData & {
  currentUser: UserDTO;
  categories: CategoryDTO[];
};

class CategoryItem extends React.Component<{
  isSorting: boolean;
  category: CategoryDTO;
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
  state: {
    sortingCategories: CategoryDTO[] | null;
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
          this.props.data.categories.map(this._renderItem)
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
              분류 이름: <input size={12} ref="nameInput" maxLength={30} />
              <button className={Styles.button}>추가</button>
            </form>
          </div>
        )}
      </CenteredFullWidth>
    );
  }

  _renderItem = (category: CategoryDTO) => {
    const isSorting = this.state.sortingCategories != null;
    return (
      <CategoryItem
        key={category.id}
        category={category}
        isSorting={isSorting}
        onRemove={() => this._removeCategory(category)}
        onRename={name => this._renameCategory(category, name)}
      />
    );
  };

  _beginSorting = () => {
    this.setState({ sortingCategories: this.props.data.categories });
  };

  _endSorting = () => {
    const categoryIDs = this.state.sortingCategories!.map(c => c.id);
    updateCategoryOrder(categoryIDs).then(
      result => {
        this.setState({ sortingCategories: null });
        this.props.writeData(data => {
          data.categories = result.categories;
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
    var input = this.refs.nameInput as HTMLInputElement;
    addCategory(input.value).then(result => {
      input.value = '';
      this.props.writeData(data => {
        data.categories.push(result.category);
      });
    });
  };

  _removeCategory = (category: CategoryDTO) => {
    if (
      confirm(
        '분류를 삭제해도 기록은 삭제되지 않습니다.\n분류를 삭제하시려면 [확인]을 누르세요.'
      )
    ) {
      removeCategory(category.id).then(() => {
        this.props.writeData(data => {
          data.categories = data.categories.filter(c => c.id !== category.id);
        });
      });
    }
  };

  _renameCategory = (category: CategoryDTO, name: string) => {
    return renameCategory(category.id, name).then(() => {
      this.props.writeData(() => {
        category.name = name;
      });
    });
  };
}

const routeHandler: RouteHandler<ManageCategoryRouteData> = {
  component: User(ManageCategory),

  async load({ loader }) {
    const currentUser = await loader.getCurrentUser({
      options: {
        stats: true,
        categories: true,
      },
    });
    return {
      currentUser,
      user: currentUser, // for layout
      categories: currentUser.categories,
    };
  },

  renderTitle({ currentUser }) {
    return `${currentUser.name} 사용자`;
  },
};
export default routeHandler;
