/* global confirm */
import React from 'react';
import Relay from 'react-relay';
import cx from 'classnames';
import Sortable from './Sortable';
import {
    AddCategoryMutation,
    ChangeCategoryOrderMutation,
    RenameCategoryMutation,
    DeleteCategoryMutation,
} from '../mutations/CategoryMutations';

var CategoryItem = React.createClass({
    getInitialState() {
        return {isEditing: false};
    },
    render() {
        if (!this.props.isSorting && this.state.isEditing)
            return <div className="category-item editing">
                <form onSubmit={this._onSubmit}>
                    <input className="name"
                        value={this.state.name}
                        onChange={this._onChange} />
                    <button type="submit">변경</button>
                    <span className="btn btn-cancel"
                        onClick={this._endEditing}>취소</span>
                </form>
            </div>;
        else {
            var actions;
            if (!this.props.isSorting) {
                actions = [
                    <span className="btn btn-rename"
                        onClick={this._startEditing}>이름 바꾸기</span>,
                    <span className="btn btn-remove"
                        onClick={this._onRemove}>삭제</span>
                ];
            }
            return <div className="category-item">
                <span className="name">{this.props.category.name}</span>
                {actions}
            </div>;
        }
    },
    _onChange(event) {
        this.setState({name: event.target.value});
    },
    _startEditing() {
        this.setState({isEditing: true, name: this.props.category.name});
    },
    _endEditing() {
        this.setState({isEditing: false});
    },
    _onRemove() {
        if (confirm('분류를 삭제해도 기록은 삭제되지 않습니다.\n분류를 삭제하시려면 [확인]을 누르세요.'))
            this.props.onRemove();
    },
    _onSubmit(event) {
        event.preventDefault();
        this.props.onRename(this.state.name);
        this._endEditing();
    }
});

var ManageCategory = React.createClass({
    getInitialState() {
        return {
            isSorting: false,
            categoryList: this.props.viewer.categories,
        };
    },
    componentWillReceiveProps(nextProps) {
        this.setState({categoryList: nextProps.viewer.categories});
    },
    render() {
        var items = this.state.categoryList.map(category =>
            <CategoryItem key={category.id}
                category={category}
                isSorting={this.state.isSorting}
                onRemove={() => Relay.Store.commitUpdate(new DeleteCategoryMutation({
                    category,
                    viewer: this.props.viewer
                }))}
                onRename={(categoryName) => Relay.Store.commitUpdate(new RenameCategoryMutation({
                    category, categoryName
                }))}
            />);
        if (this.state.isSorting) {
            items = <Sortable onSwap={this._onSwap} onDrop={this._onDrop}>
                {items}
            </Sortable>;
        }
        return <div className={cx({
            'manage-category': true,
            'sorting': this.state.isSorting
        })}>
            <h2>분류 관리</h2>
            {items}
            <div className="sort">
            {this.state.isSorting &&
                '항목을 드래그하여 순서를 바꿀 수 있습니다. '}
            <button className="btn-sort"
                onClick={() => this.setState({isSorting: !this.state.isSorting})}>
                {!this.state.isSorting ?
                    '순서 바꾸기' :
                    '순서 바꾸기 완료'}
            </button>
            </div>

            {!this.state.isSorting &&
                <h2>분류 추가</h2>}
            {!this.state.isSorting &&
                <form onSubmit={this._onAdd}>
                    분류 이름: <input size={12} ref="nameInput" />
                    <button className="btn-add">추가</button>
                </form>}
        </div>;
    },
    _onSwap(i, j) {
        var nextList = this.state.categoryList.slice();
        var temp = nextList[i];
        nextList[i] = nextList[j];
        nextList[j] = temp;
        this.setState({categoryList: nextList});
    },
    _onDrop() {
        Relay.Store.commitUpdate(new ChangeCategoryOrderMutation({
            categories: this.state.categoryList,
            viewer: this.props.viewer
        }));
    },
    _onAdd(event) {
        event.preventDefault();
        var input = this.refs.nameInput;
        Relay.Store.commitUpdate(new AddCategoryMutation({
            categoryName: input.value,
            viewer: this.props.viewer
        }));
        input.value = '';
    }
});

export default Relay.createContainer(ManageCategory, {
    fragments: {
        viewer: () => Relay.QL`
            fragment on User {
                categories {
                    id
                    name
                    ${ChangeCategoryOrderMutation.getFragment('category')}
                    ${RenameCategoryMutation.getFragment('category')}
                    ${DeleteCategoryMutation.getFragment('category')}
                }
                ${AddCategoryMutation.getFragment('viewer')}
                ${ChangeCategoryOrderMutation.getFragment('viewer')}
                ${DeleteCategoryMutation.getFragment('viewer')}
            }
        `
    }
});
