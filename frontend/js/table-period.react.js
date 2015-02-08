/* global PreloadData */
var _ = require('lodash');
var $ = require('jquery');
var React = require('react');
var util = require('./util');
var GlobalHeader = require('./GlobalHeader');
var LazyImageView = require('./LazyImage');
require('../less/table-period.less');

function getLoginURL() {
    return '/login/?next=' + encodeURIComponent(location.pathname);
}

function nullslast(val) {
    return [!val, val];
}

var scheduleComparator = util.keyComparator((item) => 
    nullslast(item.metadata.schedule.jp && item.metadata.schedule.jp.date)
);

var preferKRScheduleComparator = util.keyComparator((item) =>
    nullslast(item.metadata.schedule.kr && item.metadata.schedule.kr.date ||
        item.metadata.schedule.jp && item.metadata.schedule.jp.date)
);

var recordCountComparator = util.keyComparator((item) => -item.record_count);

var comparatorMap = {
    'schedule': scheduleComparator,
    'schedule.kr': preferKRScheduleComparator,
    'recordCount': recordCountComparator
};

var scheduleStore = {
    addChangeListener(callback) {
        this._listeners.push(callback);
    },

    removeChangeListener(callback) {
        this._listeners = this._listeners.filter(cb => cb != callback);
    },

    emitChange(data) {
        this._listeners.forEach(callback => callback(data));
    },

    initialize(initialData) {
        this._listeners = [];
        this._items = initialData;
        this._ordering = window.localStorage['animeta.table.' + PreloadData.period + '.ordering'] || 'schedule';
        this._containsKRSchedule = _.some(initialData, i => i.metadata.schedule.kr && i.metadata.schedule.kr.date);
        this._sort();
    },

    getAllItems() {
        return this._items;
    },

    getOrdering() {
        return this._ordering;
    },

    setOrdering(ordering) {
        this._ordering = ordering;
        window.localStorage['animeta.table.' + PreloadData.period + '.ordering'] = ordering;
        this._sort();
        this.emitChange();
    },

    _sort() {
        this._items.sort(comparatorMap[this._ordering]);
    },

    containsKRSchedule() {
        return this._containsKRSchedule;
    },

    favoriteItem(item) {
        return $.post('/api/v1/records', {
            work: item.title,
            status_type: 'interested'
        }).then((result) => {
            item.record = {
                id: result.record_id
            };
            item.record_count++;
            this.emitChange({
                event: 'favorite-added',
                title: item.title
            });
        });
    }
};
scheduleStore.initialize(PreloadData.schedule);

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
                onClick={() => scheduleStore.setOrdering(option.value)}>{option.label}</span>;
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
        return (
            <div className="item">
                <div className="item-inner">
                    <div className="item-poster-wrap">
                        <LazyImageView src={item.metadata.image_url} width={233} height={318} className="item-poster" />
                    </div>
                    <div dangerouslySetInnerHTML={{__html: ItemView.template(this.getTemplateContext())}} />
                    <div className="item-actions">
                        <FavButton active={item.record != null}
                            count={item.record_count}
                            onClick={this.handleFavButtonClick} />
                    </div>
                </div>
            </div>
        );
    },

    handleFavButtonClick() {
        if (!PreloadData.current_user) {
            alert('로그인 후 관심 등록할 수 있습니다.');
            location.href = getLoginURL();
            return;
        }

        var record = this.props.item.record;
        if (record) {
            window.open('/records/' + record.id + '/');
        } else {
            scheduleStore.favoriteItem(this.props.item);
        }
    },

    getTemplateContext() {
        var context = _.cloneDeep(this.props.item.metadata);
        if (context.studios)
            context.studios = context.studios.join(', ');
        if (context.source)
            context.source = util.SOURCE_TYPE_MAP[context.source];
        if (!context.schedule.jp)
            context.schedule.jp = {};
        ['jp', 'kr'].forEach((country) => {
            var schedule = context.schedule[country];
            if (!schedule) {
                return;
            }
            var date = schedule.date;
            if (date) {
                date = new Date(date);
                schedule.date = getDate(date);
                schedule.time = util.formatTime(date);
            }
            if (schedule.broadcasts)
                schedule.broadcasts = schedule.broadcasts.join(', ');
        });
        return context;
    },

    statics: {
        template: require('!handlebars!./table-period-item.hbs')
    }
});

var NotificationView = React.createClass({
    getInitialState() {
        return {hidden: true};
    },

    componentWillUnmount() {
        if (this.state.timer)
            clearTimeout(this.state.timer);
    },

    show(message, timeout) {
        var update = {
            message: message,
            hidden: false
        };
        if (this.state.timer)
            clearTimeout(this.state.timer);
        if (timeout)
            update.timer = setTimeout(() => this.setState({hidden: true}), timeout);
        this.setState(update);
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

function getAppViewState() {
    return {
        items: scheduleStore.getAllItems(),
        ordering: scheduleStore.getOrdering(),
        excludeKR: !scheduleStore.containsKRSchedule()
    };
}

var AppView = React.createClass({
    getInitialState() {
        return getAppViewState();
    },

    componentDidMount() {
        scheduleStore.addChangeListener(this._onChange);
        if (!PreloadData.current_user) {
            this.refs.notification.show([
                '관심 등록은 로그인 후 가능합니다. ',
                <a href={getLoginURL()} className="btn btn-login">로그인</a>
            ]);
        }
    },

    componentWillUnmount() {
        scheduleStore.removeChangeListener(this._onChange);
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
                <NotificationView ref="notification" />
            </div>
        );
    },

    _onChange(data) {
        this.setState(getAppViewState());
        if (data && data.event == 'favorite-added') {
            this.refs.notification.show(['관심 등록 완료 — ', <b>{data.title}</b>], 3000);
        }
    }
});

React.render(<AppView period={PreloadData.period} />,
    document.getElementById('app'));
