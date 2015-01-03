/* global initTypeahead */
var React = require('react/addons');
var Router = require('react-router');
var RecordActions = require('./RecordActions');

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
                {categoryList.filter(category => category.id).map(category =>
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
    mixins: [Router.Navigation, Router.State],

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
                        defaultValue={this.getParams().title} /></td>
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
                            categoryList={this.props.user.categoryList}
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
        initTypeahead(this.refs.title.getDOMNode());
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
        var data = $(this.getDOMNode()).serialize();
        RecordActions.addRecord(this.props.user.name, data).then(() => {
            this.transitionTo('records');
        }).always(() => {
            if (this.isMounted())
                this.setState({isRequesting: false});
        });
    }
});

module.exports = AddRecord;
