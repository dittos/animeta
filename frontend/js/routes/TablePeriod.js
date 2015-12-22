var React = require('react');
var {Container} = require('flux/utils');
var {Link} = require('react-router');
var util = require('../util');
var ScheduleStore = require('../table/ScheduleStore');
var TableActions = require('../table/TableActions');
var Notifications = require('../table/Notifications');
var LazyImageView = require('../ui/LazyImage');
import LoginDialog from '../ui/LoginDialog';
var {createContainer} = require('../Isomorphic');
var Periods = require('../Periods');

function formatPeriod(period) {
    var parts = period.split('Q');
    var year = parts[0], quarter = parts[1];
    return year + '년 ' + [1, 4, 7, 10][quarter - 1] + '월';
}

function offsetPeriod(period, offset) {
    // move to API server?
    var parts = period.split('Q');
    var year = parseInt(parts[0], 10);
    var quarter = parseInt(parts[1], 10);
    quarter += offset;
    if (quarter === 0) {
        year--;
        quarter = 4;
    } else if (quarter === 5) {
        year++;
        quarter = 1;
    }
    return `${year}Q${quarter}`;
}

function PageTitle(props) {
    var period = props.period;
    var prevPeriod = period !== Periods.min && offsetPeriod(props.period, -1);
    var nextPeriod = period !== Periods.current && offsetPeriod(props.period, +1);
    return <h1 className="page-title">
        {prevPeriod &&
            <Link to={`/table/${prevPeriod}/`}><i className="fa fa-caret-left" /></Link>}
        {formatPeriod(period)} 신작
        {nextPeriod &&
            <Link to={`/table/${nextPeriod}/`}><i className="fa fa-caret-right" /></Link>}
    </h1>;
}

var HeaderView = React.createClass({
    render() {
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
                        <label className="hide-mobile">정렬: </label>
                        <div className="switch">
                            {switches}
                        </div>
                    </div>
                </div>
                <PageTitle period={this.props.period} />
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
                                {source && [' / ', <span className="source">{util.SOURCE_TYPE_MAP[source]}</span>]}
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
        if (!this.props.currentUser) {
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

var TablePeriod = Container.create(React.createClass({
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
                <div className="table-container">
                    <HeaderView period={this.props.params.period}
                        ordering={this.state.ordering}
                        excludeKR={this.state.excludeKR} />

                    <div className="items">
                    {this.state.items.map((item) =>
                        <ItemView item={item} key={item.id} currentUser={this.props.current_user} />
                    )}
                    </div>
                </div>
                <NotificationView />
            </div>
        );
    }
}), {pure: false});

function getLoginURL() {
    return '/login/?next=' + encodeURIComponent(location.pathname);
}

export default createContainer(TablePeriod, {
    getPreloadKey(props) {
        return `table/${props.params.period}`;
    },

    async fetchData(client, props) {
        var [current_user, schedule] = await Promise.all([
            client.getCurrentUser(),
            client.call(`/table/periods/${props.params.period}`, {
                only_first_period: JSON.stringify(true)
            })
        ]);
        return {
            current_user,
            schedule
        };
    },

    getTitle(props) {
        return `${formatPeriod(props.params.period)} 신작`;
    },

    onLoad(props, data) {
        TableActions.initialize(data.schedule);

        if (!data.current_user) {
            Notifications.show([
                '관심 등록은 로그인 후 가능합니다. ',
                <a href={getLoginURL()} className="btn btn-login" onClick={event => {
                    event.preventDefault();
                    LoginDialog.open();
                }}>로그인</a>
            ]);
        }
    }
});
