/** @jsx React.DOM */

function getLoginURL() {
    return '/login/?next=' + encodeURIComponent(location.pathname);
}

function nullslast(val) {
    return [!val, val];
}

function keyComparator(keyFunc) {
    return (a, b) => {
        a = keyFunc(a);
        b = keyFunc(b);
        if (a < b)
            return -1;
        if (a > b)
            return 1;
        return 0;
    };
}

var scheduleComparator = keyComparator((item) => 
    nullslast(item.schedule.jp && item.schedule.jp.date)
);

var preferKRScheduleComparator = keyComparator((item) =>
    nullslast(item.schedule.kr && item.schedule.kr.date
        || item.schedule.jp && item.schedule.jp.date)
);

var recordCountComparator = keyComparator((item) => -item.record_count);

var comparatorMap = {
    'schedule': scheduleComparator,
    'schedule.kr': preferKRScheduleComparator,
    'recordCount': recordCountComparator
};

class ChangeListenable {
    constructor() {
        this._listeners = [];
    }

    addChangeListener(callback) {
        this._listeners.push(callback);
    }

    removeChangeListener(callback) {
        this._listeners = this._listeners.filter((cb) => cb != callback);
    }

    emitChange(data) {
        this._listeners.forEach((callback) => callback(data));
    }
}

class ScheduleStore extends ChangeListenable {
    constructor(initialData) {
        super();
        this._items = initialData.items;
        this._ordering = window.localStorage['animeta.table.' + PERIOD + '.ordering'] || 'schedule';
        this._containsKRSchedule = initialData.contains_kr_schedule;
        this._sort();
    }

    getAllItems() {
        return this._items;
    }

    getOrdering() {
        return this._ordering;
    }

    setOrdering(ordering) {
        this._ordering = ordering;
        window.localStorage['animeta.table.' + PERIOD + '.ordering'] = ordering;
        this._sort();
        this.emitChange();
    }

    _sort() {
        this._items.sort(comparatorMap[this._ordering]);
    }

    containsKRSchedule() {
        return this._containsKRSchedule;
    }

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
}

var scheduleStore = new ScheduleStore(APP_DATA);

function formatPeriod(period) {
    var parts = period.split('Q');
    var year = parts[0], quarter = parts[1];
    return year + '년 ' + [1, 4, 7, 10][quarter - 1] + '월';
}

var HeaderView = React.createClass({
    render: function() {
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

var blazy = null;
// Disable lazy loading on mobile browsers.
if (!/i(Phone|Pad|Pod)|Android|Safari/.test(navigator.userAgent)) {
    document.documentElement.className += ' b-fade';
    blazy = new Blazy;
}

BLANK_IMG_URI = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

var ItemPosterView = React.createClass({
    width: 233,
    height: 318,

    render: blazy ? function() {
        return <img src={BLANK_IMG_URI} data-src={this.props.src}
            width={this.width} height={this.height} className="item-poster b-lazy" />;
    } : function() {
        return <img src={this.props.src} width={this.width} height={this.height} className="item-poster" />;
    },

    componentDidMount: function() {
        ItemPosterView.invalidate();
    },

    componentDidUpdate: function() {
        ItemPosterView.invalidate();
    },
    
    statics: {
        invalidation: null,

        invalidate: function() {
            if (!this.invalidation) {
                this.invalidation = setTimeout(() => {
                    blazy.revalidate();
                    this.invalidation = null;
                }, 0);
            }
        }
    }
});

SOURCE_TYPE_MAP = {
    'manga': '만화 원작', 
    'original': '오리지널',
    'lightnovel': '라노베 원작',
    'game': '게임 원작',
    '4koma': '4컷 만화 원작',
    'visualnovel': '비주얼 노벨 원작',
    'novel': '소설 원작'
};

function zerofill(n) {
    n = String(n);
    if (n.length == 1)
        n = '0' + n;
    return n;
}

WEEKDAYS = ['월', '화', '수', '목', '금', '토', '일'];

function getDate(value) {
    var weekday = WEEKDAYS[value.getDay()];
    return zerofill(value.getMonth() + 1) + '/' + zerofill(value.getDate()) + ' (' + weekday + ')';
}

HOURS = [];
for (var h = 0; h < 24; h++) {
    var result;
    if (h < 12)
        result = '오전 ' + h + '시';
    else if (h == 12)
        result = '정오';
    else
        result = '오후 ' + (h - 12) + '시';
    HOURS[h] = result;
}

function getTime(value) {
    var result = HOURS[value.getHours()];
    var m = value.getMinutes();
    if (m > 0) {
        result += ' ' + zerofill(m) + '분';
    }
    return result;
}

var FavButton = React.createClass({
    render: function() {
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
    render: function() {
        var item = this.props.item;
        return (
            <div className="item">
                <div className="item-inner">
                    <div className="item-poster-wrap">
                        <ItemPosterView src={item.image_url} />
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

    handleFavButtonClick: function() {
        if (!USERNAME) {
            alert('로그인 후 관심 등록할 수 있습니다.');
            location.href = getLoginURL();
            return;
        }

        var self = this;
        var record = this.props.item.record;
        if (record) {
            window.open('/records/' + record.id + '/');
        } else {
            scheduleStore.favoriteItem(this.props.item);
        }
    },

    getTemplateContext: function() {
        var context = $.extend(/*deep:*/ true, {}, this.props.item);
        if (context.studios)
            context.studios = context.studios.join(', ');
        if (context.source)
            context.source = SOURCE_TYPE_MAP[context.source];
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
                schedule.time = getTime(date);
            }
            if (schedule.broadcasts)
                schedule.broadcasts = schedule.broadcasts.join(', ');
        });
        return context;
    },

    statics: {
        template: Handlebars.compile($('#template-item-info').html())
    }
});

var NotificationView = React.createClass({
    getInitialState: function() {
        return {hidden: true};
    },

    componentWillUnmount: function() {
        if (this.state.timer)
            clearTimeout(this.state.timer);
    },

    show: function(message, timeout) {
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

    render: function() {
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
    getInitialState: function() {
        return getAppViewState();
    },

    componentDidMount: function() {
        scheduleStore.addChangeListener(this._onChange);
        if (!USERNAME) {
            this.refs.notification.show([
                '관심 등록은 로그인 후 가능합니다. ',
                <a href={getLoginURL()} className="btn btn-login">로그인</a>
            ]);
        }
    },

    componentWillUnmount: function() {
        scheduleStore.removeChangeListener(this._onChange);
    },

    render: function() {
        return (
            <div>
                <HeaderView period={this.props.period}
                    ordering={this.state.ordering}
                    excludeKR={this.state.excludeKR} />

                <div className="items">
                {this.state.items.map((item) =>
                    <ItemView item={item} key={item.id} />
                )}
                </div>

                <NotificationView ref="notification" />
            </div>
        );
    },

    _onChange: function(data) {
        this.setState(getAppViewState());
        if (data && data.event == 'favorite-added') {
            this.refs.notification.show(['관심 등록 완료 — ', <b>{data.title}</b>], 3000);
        }
    }
});

React.renderComponent(
    <AppView period={PERIOD} />,
    $('.anitable-container')[0]
);
