/* global PreloadData */
var React = require('react');
var {Container} = require('flux/utils');
var util = require('./util');
var ScheduleStore = require('./table/ScheduleStore');
var TableActions = require('./table/TableActions');
var Notifications = require('./table/Notifications');
var GlobalHeader = require('./ui/GlobalHeader');
var LazyImageView = require('./ui/LazyImage');
var LoginDialog = require('./ui/LoginDialog');
require('../less/table-period.less');

function formatPeriod(period) {
    var parts = period.split('Q');
    var year = parts[0], quarter = parts[1];
    return year + '년 ' + [1, 4, 7, 10][quarter - 1] + '월';
}

var HeaderView = React.createClass({
    render() {
        var period = formatPeriod(this.props.period);
        var options;
        if (!this.props.excludeKR) {
            options = [
                {value: 'schedule', label: '날짜 (日)'},
                {value: 'schedule.kr', label: '날짜 (韓)'},
                {value: 'recordCount', label: '인기'}
            ];
        } else {
            options = [
                {value: 'schedule', label: '날짜'},
                {value: 'recordCount', label: '인기'}
            ];
        }
        var switches = options.map((option) => {
            return <span className={this.props.ordering == option.value ? 'active' : ''}
                key={option.value}
                onClick={() => TableActions.sort(option.value)}>{option.label}</span>;
        });
        return (
            <div className="page-header">
                <div className="settings">
                    <div className="settings-item prefer-kr">
                        <label>정렬: </label>
                        <div className="switch">
                            {switches}
                        </div>
                    </div>
                </div>
                <h1 className="page-title">{period} 신작</h1>
            </div>
        );
    }
});

var WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function getDate(value) {
    var weekday = WEEKDAYS[value.getDay()];
    return util.zerofill(value.getMonth() + 1) + '/' + util.zerofill(value.getDate()) + ' (' + weekday + ')';
}

var FavButton = React.createClass({
    render() {
        return (
            <label className={'btn-fav' + (this.props.active ? ' active' : '')}
                onClick={this.props.onClick}>
                <i className="fa fa-check"></i>
                {' ' + this.props.count}
            </label>
        );
    }
});

var ItemView = React.createClass({
    render() {
        var item = this.props.item;
        var {links, studios, source, schedule} = item.metadata;
        return (
            <div className="item">
                <div className="item-inner">
                    <div className="item-poster-wrap">
                        <LazyImageView src={item.metadata.image_url} width={233} height={318} className="item-poster" />
                    </div>
                    <div className="item-frame">
                        <div className="item-overlay">
                            <h3 className="item-title">{item.metadata.title}</h3>
                            <div className="item-info">
                                <span className="studio">{studios ? studios.join(', ') : '제작사 미정'}</span>
                                {source && ['/ ', <span className="source">{util.SOURCE_TYPE_MAP[source]}</span>]}
                            </div>
                            {this._renderSchedule('jp', schedule.jp)}
                            {schedule.kr && this._renderSchedule('kr', schedule.kr)}
                        </div>
                    </div>
                    <div className="item-links">
                        {links.website &&
                            <a href={links.website} className="link link-official" target="_blank">공식 사이트</a>}
                        {links.namu &&
                            <a href={links.namu} className="link link-namu" target="_blank">나무위키</a>}
                        {links.ann &&
                            <a href={links.ann} className="link link-ann" target="_blank">ANN (en)</a>}
                    </div>
                    <div className="item-actions">
                        <FavButton active={item.record != null}
                            count={item.record_count}
                            onClick={this.handleFavButtonClick} />
                    </div>
                </div>
            </div>
        );
    },

    _renderSchedule(country, schedule) {
        var {date, broadcasts} = schedule;
        if (date) {
            date = new Date(date);
        }
        return <div className={"item-schedule item-schedule-" + country}>
            {date ? [
                <span className="date">{getDate(date)}</span>,
                ' ',
                <span className="time">{util.formatTime(date)}</span>
            ] : <span className="date">미정</span>}
            {broadcasts &&
                [' ', <span className="broadcasts">({broadcasts.join(', ')})</span>]}
        </div>;
    },

    handleFavButtonClick() {
        if (!PreloadData.current_user) {
            alert('로그인 후 관심 등록할 수 있습니다.');
            LoginDialog.open();
            return;
        }

        var record = this.props.item.record;
        if (record) {
            window.open('/records/' + record.id + '/');
        } else {
            TableActions.favoriteItem(this.props.item)
                .then(data => Notifications.show(['관심 등록 완료 — ', <b>{data.title}</b>], 3000));
        }
    }
});

var NotificationView = React.createClass({
    getInitialState() {
        return Notifications.getState();
    },

    componentWillMount() {
        Notifications.setListener(this._onChange);
    },

    componentWillUnmount() {
        Notifications.clearListener(this._onChange);
    },

    _onChange() {
        this.setState(Notifications.getState());
    },

    render() {
        return (
            <div className={"panel" + (this.state.hidden ? ' hidden' : '')}>
                <div className="panel-inner">
                {this.state.message}
                </div>
            </div>
        );
    }
});

var AppView = Container.create(React.createClass({
    statics: {
        getStores() {
            return [ScheduleStore];
        },

        calculateState() {
            return {
                items: ScheduleStore.getAllItems(),
                ordering: ScheduleStore.getOrdering(),
                excludeKR: !ScheduleStore.containsKRSchedule()
            };
        }
    },

    render() {
        return (
            <div>
                <GlobalHeader currentUser={PreloadData.current_user} />
                <div className="table-container">
                    <HeaderView period={this.props.period}
                        ordering={this.state.ordering}
                        excludeKR={this.state.excludeKR} />

                    <div className="items">
                    {this.state.items.map((item) =>
                        <ItemView item={item} key={item.id} />
                    )}
                    </div>
                </div>
                <NotificationView />
            </div>
        );
    }
}), {pure: false});

if (!PreloadData.current_user) {
    function getLoginURL() {
        return '/login/?next=' + encodeURIComponent(location.pathname);
    }

    Notifications.show([
        '관심 등록은 로그인 후 가능합니다. ',
        <a href={getLoginURL()} className="btn btn-login" onClick={event => {
            event.preventDefault();
            LoginDialog.open();
        }}>로그인</a>
    ]);
}

TableActions.initialize(PreloadData.schedule);

React.render(<AppView period={PreloadData.period} />,
    document.getElementById('app'));
