/** @jsx React.DOM */

var BaseStore = require('./BaseStore');

class RecordStore extends BaseStore {
    constructor(title, categoryId) {
        super();
        this._title = title;
        this._categoryId = categoryId;
    }

    setTitle(title) {
        this._title = title;
        this.emitChange();
    }

    getTitle() {
        return this._title;
    }

    getCategoryId() {
        return this._categoryId;
    }

    setCategoryId(categoryId) {
        this._categoryId = categoryId;
        this.emitChange();
    }
}

function getWorkURL(title) {
    return '/works/' + encodeURIComponent(title) + '/';
}

var recordStore;

var TitleEditView = React.createClass({
    componentDidMount() {
        var typeahead = initTypeahead(this.refs.titleInput.getDOMNode());
        typeahead.on('keypress', event => {
            if (event.keyCode == 13) {
                this.handleSave();
            }
        });
    },

    render() {
        return (
            <div className="title-form">
                <input ref="titleInput" defaultValue={this.props.originalTitle} />
                <button onClick={this.handleSave}>저장</button>
                {' '}<a href="#" onClick={this.handleCancel}>취소</a>
            </div>
        );
    },

    handleSave() {
        this.props.onSave(this.refs.titleInput.getDOMNode().value);
    },

    handleCancel(event) {
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
                <select value={this.props.selectedId} onChange={this.handleChange}>
                    <option value="">지정 안함</option>
                    {this.props.categoryList.map(category =>
                        <option value={category.id}>{category.name}</option>
                    )}
                </select>
            </span>
        );
    },

    handleChange(event) {
        this.props.onChange(event.target.value);
    }
});

var HeaderView = React.createClass({
    getInitialState() {
        return {isEditingTitle: false};
    },

    render() {
        var titleEditor;
        if (this.state.isEditingTitle) {
            titleEditor = <TitleEditView
                recordId={this.props.recordId}
                originalTitle={this.props.title}
                onSave={this.handleTitleSave}
                onCancel={() => this.setState({isEditingTitle: false})} />;
        } else {
            titleEditor = [
                <h1><a href={getWorkURL(this.props.title)} className="work">{this.props.title}</a></h1>,
                <a href="#" className="btn btn-edit-title" onClick={this.handleTitleEditButtonClick}>
                    제목 수정
                </a>
            ];
        }

        return (
            <div className="record-detail-header">
                {titleEditor}
                <a href={`/records/${this.props.recordId}/delete/`} className="btn btn-delete">삭제</a>
                <CategoryEditView categoryList={this.props.categoryList}
                    selectedId={this.props.categoryId}
                    onChange={this.handleCategoryChange} />
            </div>
        );
    },

    handleTitleEditButtonClick(event) {
        event.preventDefault();
        this.setState({isEditingTitle: true});
    },

    handleTitleSave(title) {
        $.post(`/records/${this.props.recordId}/update/title/`, {title: title})
            .then(result => {
                recordStore.setTitle(title);
                this.setState({isEditingTitle: false});
            });
    },

    handleCategoryChange(categoryId) {
        $.post(`/records/${this.props.recordId}/update/category/`, {category: categoryId})
            .then(result => {
                recordStore.setCategoryId(categoryId);
            });
    }
});

function getRecordStoreState() {
    return {
        title: recordStore.getTitle(),
        categoryId: recordStore.getCategoryId()
    };
}

var AppView = React.createClass({
    getInitialState() {
        return getRecordStoreState();
    },

    _onChange() {
        this.setState(getRecordStoreState());
    },

    componentDidMount() {
        recordStore.addChangeListener(this._onChange);
    },

    render() {
        return (
            <HeaderView
                recordId={this.props.recordId}
                title={this.state.title}
                categoryId={this.state.categoryId}
                categoryList={this.props.categoryList} />
        );
    }
});

recordStore = new RecordStore(APP_DATA.title, APP_DATA.categoryId);

React.renderComponent(AppView(APP_DATA), $('.library-container')[0]);

$(document).ajaxError((event, jqXHR, settings, thrownError) => {
    if (jqXHR.responseText) {
        try {
            var err = $.parseJSON(jqXHR.responseText);
            alert(err.message);
            return;
        } catch (e) {
        }
    }
    alert('서버 오류로 요청에 실패했습니다.');
});
