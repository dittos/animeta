import React from 'react';
import Typeahead from './Typeahead';
import Relay from 'react-relay';
import {AddRecordMutation} from '../mutations/RecordMutations';

const NULL_CATEGORY_ID = 'NO_CATEGORY_ID';

var CategorySelect = React.createClass({
    render() {
        var {selectedId, categoryList, ...props} = this.props;
        return (
            <select {...props}
                value={selectedId}
                onChange={this._onChange}>
                <option value={NULL_CATEGORY_ID}>지정 안함</option>
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
            selectedCategoryId: NULL_CATEGORY_ID,
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
                    <td><input name="work_title" ref="title"
                        defaultValue={this.props.defaultTitle} /></td>
                </tr>
                <tr>
                    <th>감상 상태</th>
                    <td>
                        <select name="status_type"
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
                        <CategorySelect name="category_id"
                            categoryList={this.props.viewer.categories}
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
        Relay.Store.commitUpdate(new AddRecordMutation({
            user: this.props.viewer,
            title: this.refs.title.value,
            statusType: this.state.statusType,
            category: this.state.selectedCategoryId != NULL_CATEGORY_ID ?
                this.props.viewer.categories.filter(c => c.id === this.state.selectedCategoryId)[0] :
                null
        }), {
            onSuccess: () => {
                this.props.onSave();
                if (this.isMounted())
                    this.setState({isRequesting: false});
            }
        });
    }
});

var AddRecordRoute = React.createClass({
    render() {
        // XXX: decode one more time due to react-router bug
        // https://github.com/rackt/react-router/issues/650
        var defaultTitle = decodeURIComponent(this.props.params.title || '');
        return <AddRecord
            {...this.props}
            defaultTitle={defaultTitle}
            onSave={this._onSave}
        />;
    },
    _onSave() {
        this.props.history.pushState(null, this.props.history.libraryPath);
    }
});

export default Relay.createContainer(AddRecordRoute, {
    fragments: {
        viewer: () => Relay.QL`
            fragment on User {
                ${AddRecordMutation.getFragment('user')}
                categories {
                    id
                    name
                    ${AddRecordMutation.getFragment('category')}
                }
            }
        `
    }
});
