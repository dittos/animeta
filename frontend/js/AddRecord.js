var $ = require('jquery');
var React = require('react/addons');
var Router = require('react-router');
var RecordActions = require('./RecordActions');
var CategoryStore = require('./CategoryStore');
var Typeahead = require('./Typeahead');

var CategorySelect = React.createClass({
    render() {
        var {selectedId, categoryList, ...props} = this.props;
        var name = '지정 안함';
        if (selectedId) {
            name = categoryList.filter(
                category => category.id == selectedId
            )[0].name;
        }
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
            selectedCategoryId: 0,
            statusType: 'watching',
            isRequesting: false
        };
    },

    render() {
        return <form className="record-add-form">
            <table>
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
                            categoryList={CategoryStore.getAll()}
                            selectedId={this.state.selectedCategoryId}
                            onChange={this._onCategoryChange} />
                    </td>
                </tr>
            </table>
            <button type="button"
                disabled={this.state.isRequesting}
                onClick={this._onSubmit}>
                {this.state.isRequesting ? '추가하는 중...' : '작품 추가'}
            </button>
        </form>;
    },

    componentDidMount() {
        Typeahead.initSuggest(React.findDOMNode(this.refs.title));
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
        var data = $(React.findDOMNode(this)).serialize();
        RecordActions.addRecord(this.props.user.name, data).then(() => {
            this.props.onSave();
        }).always(() => {
            if (this.isMounted())
                this.setState({isRequesting: false});
        });
    }
});

var AddRecordContainer = React.createClass({
    mixins: [Router.Navigation],
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
        this.transitionTo('records');
    }
});

module.exports = AddRecordContainer;
