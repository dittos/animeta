import React from 'react';
import Relay from 'react-relay';
import {Link} from 'react-router';
import Typeahead from './Typeahead';
import {getWorkURL} from '../util';
import {
    ChangeRecordCategoryMutation,
    ChangeRecordTitleMutation,
} from '../mutations/RecordMutations';

var TitleEditView = React.createClass({
    componentDidMount() {
        var typeahead = Typeahead.initSuggest(this.refs.titleInput);
        typeahead.on('keypress', event => {
            if (event.keyCode == 13) {
                this._onSave();
            }
        });
    },

    render() {
        return (
            <div className="title-form">
                <input ref="titleInput" defaultValue={this.props.originalTitle} />
                <button onClick={this._onSave}>저장</button>
                {' '}<a href="#" onClick={this._onCancel}>취소</a>
            </div>
        );
    },

    _onSave() {
        this.props.onSave(this.refs.titleInput.value);
    },

    _onCancel(event) {
        event.preventDefault();
        this.props.onCancel();
    }
});

var CategoryEditView = React.createClass({
    render() {
        var name = '지정 안함';
        if (this.props.selectedId) {
            name = this.props.categoryList.filter(
                category => category.id == this.props.selectedId
            )[0].name;
        }
        return (
            <span className="category-form btn">
                <label>분류: </label>
                {name} ▼
                <select value={this.props.selectedId} onChange={this._onChange}>
                    <option value="">지정 안함</option>
                    {this.props.categoryList.map(category =>
                        <option value={category.id}>{category.name}</option>
                    )}
                </select>
            </span>
        );
    },

    _onChange(event) {
        var categoryId = event.target.value;
        this.props.onChange(categoryId);
    }
});

var Header = React.createClass({
    getInitialState() {
        return {isEditingTitle: false};
    },

    render() {
        const title = this.props.record.title;
        const canEdit = this.props.viewer && this.props.viewer.id === this.props.record.user_id;

        var titleEditor, editTitleButton;
        if (this.state.isEditingTitle) {
            titleEditor = <TitleEditView
                originalTitle={title}
                onSave={this._onTitleSave}
                onCancel={() => this.setState({isEditingTitle: false})} />;
        } else {
            titleEditor = <h1 className="record-detail-title">
                <a href={getWorkURL(title)}>{title}</a>
            </h1>;
            editTitleButton = (
                <a href="#" className="btn btn-edit-title" onClick={this._onTitleEditButtonClick}>
                    제목 수정
                </a>
            );
        }
        var toolbar;
        if (canEdit) {
            toolbar = (
                <div className="record-detail-toolbar">
                    {editTitleButton}
                    <Link to={`/records/${this.props.record.simple_id}/delete/`} className="btn btn-delete">삭제</Link>
                    <CategoryEditView
                        categoryList={this.props.viewer.categories}
                        selectedId={this.props.record.category_id}
                        onChange={this._onCategoryChange}
                    />
                </div>
            );
        }

        return (
            <div className="record-detail-header">
                {titleEditor}
                {toolbar}
            </div>
        );
    },

    _onTitleEditButtonClick(event) {
        event.preventDefault();
        this.setState({isEditingTitle: true});
    },

    _onTitleSave(title) {
        Relay.Store.commitUpdate(new ChangeRecordTitleMutation({
            record: this.props.record,
            title
        }));
        this.setState({isEditingTitle: false});
    },

    _onCategoryChange(categoryId) {
        Relay.Store.commitUpdate(new ChangeRecordCategoryMutation({
            record: this.props.record,
            category: categoryId ? this.props.viewer.categories.filter(c => c.id === categoryId)[0] : null
        }));
    }
});

export default Relay.createContainer(Header, {
    fragments: {
        record: () => Relay.QL`
            fragment on Record {
                simple_id
                title
                user_id
                category_id
                ${ChangeRecordCategoryMutation.getFragment('record')}
                ${ChangeRecordTitleMutation.getFragment('record')}
            }
        `,
        viewer: () => Relay.QL`
            fragment on User {
                id
                categories {
                    id
                    name
                    ${ChangeRecordCategoryMutation.getFragment('category')}
                }
            }
        `
    }
});
