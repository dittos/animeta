import React from 'react';
import {createRecord} from '../API';
import {User} from '../layouts';
import Typeahead from '../ui/Typeahead';
// TODO: css module

var CategorySelect = React.createClass({
    render() {
        var {selectedId, categoryList, ...props} = this.props;
        return (
            <select {...props}
                value={selectedId}
                onChange={this._onChange}>
                <option value="">지정 안함</option>
                {categoryList.map(category =>
                    <option value={category.id}>{category.name}</option>
                )}
            </select>
        );
    },

    _onChange(event) {
        if (this.props.onChange)
            this.props.onChange(event.target.value);
    }
});

var AddRecord = React.createClass({
    getInitialState() {
        return {
            selectedCategoryId: '',
            statusType: 'watching',
            isRequesting: false
        };
    },

    render() {
        return <form className="record-add-form">
            <table>
                <tbody>
                <tr>
                    <th>작품 제목</th>
                    <td><input ref="title"
                        defaultValue={this.props.data.title} /></td>
                </tr>
                <tr>
                    <th>감상 상태</th>
                    <td>
                        <select
                            value={this.state.statusType}
                            onChange={this._onStatusTypeChange}>
                            <option value="watching">보는 중</option>
                            <option value="finished">완료</option>
                            <option value="suspended">중단</option>
                            <option value="interested">볼 예정</option>
                        </select>
                    </td>
                </tr>
                <tr>
                    <th>분류</th>
                    <td>
                        <CategorySelect
                            categoryList={this.props.data.user.categories}
                            selectedId={this.state.selectedCategoryId}
                            onChange={this._onCategoryChange} />
                    </td>
                </tr>
                </tbody>
            </table>
            <button type="button"
                disabled={this.state.isRequesting}
                onClick={this._onSubmit}>
                {this.state.isRequesting ? '추가하는 중...' : '작품 추가'}
            </button>
        </form>;
    },

    componentDidMount() {
        Typeahead.initSuggest(this.refs.title);
    },

    _onTitleChange(event) {
        this.setState({title: event.target.value});
    },

    _onCategoryChange(categoryId) {
        this.setState({selectedCategoryId: categoryId});
    },

    _onStatusTypeChange(event) {
        this.setState({statusType: event.target.value});
    },

    _onSubmit(event) {
        event.preventDefault();
        if (this.state.isRequesting)
            return;
        this.setState({isRequesting: true});
        createRecord(this.props.data.user.name, {
            title: this.refs.title.value,
            statusType: this.state.statusType,
            categoryID: this.state.selectedCategoryId,
        }).then(() => {
            const basePath = `/users/${encodeURIComponent(this.props.data.user.name)}/`;
            this.props.controller.load({path: basePath, query: {}});
        }).always(() => {
            if (this.isMounted())
                this.setState({isRequesting: false});
        });
    }
});

export default {
    component: User(AddRecord),

    async load({ loader, params }) {
        const currentUser = await loader.getCurrentUser();
        return {
            currentUser,
            user: currentUser, // for layout
            title: params.title,
        };
    },

    renderTitle({ currentUser }) {
        return `${currentUser.name} 사용자`;
    }
};
