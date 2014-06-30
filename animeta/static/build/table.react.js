/** @jsx React.DOM */

function getLoginURL() {
    return '/login/?next=' + encodeURIComponent(location.pathname);
}

function nullslast(val) {
    return [!val, val];
}

function keyComparator(keyFunc) {
    return function(a, b)  {
        a = keyFunc(a);
        b = keyFunc(b);
        if (a < b)
            return -1;
        if (a > b)
            return 1;
        return 0;
    };
}

var scheduleComparator = keyComparator(function(item)  
    {return nullslast(item.schedule.jp && item.schedule.jp.date);}
);

var preferKRScheduleComparator = keyComparator(function(item) 
    {return nullslast(item.schedule.kr && item.schedule.kr.date
        || item.schedule.jp && item.schedule.jp.date);}
);

var recordCountComparator = keyComparator(function(item)  {return -item.record_count;});

var comparatorMap = {
    'schedule': scheduleComparator,
    'schedule.kr': preferKRScheduleComparator,
    'recordCount': recordCountComparator
};


    function ChangeListenable() {"use strict";
        this.$ChangeListenable_listeners = [];
    }

    ChangeListenable.prototype.addChangeListener=function(callback) {"use strict";
        this.$ChangeListenable_listeners.push(callback);
    };

    ChangeListenable.prototype.removeChangeListener=function(callback) {"use strict";
        this.$ChangeListenable_listeners = this.$ChangeListenable_listeners.filter(function(cb)  {return cb != callback;});
    };

    ChangeListenable.prototype.emitChange=function(data) {"use strict";
        this.$ChangeListenable_listeners.forEach(function(callback)  {return callback(data);});
    };


for(var ChangeListenable____Key in ChangeListenable){if(ChangeListenable.hasOwnProperty(ChangeListenable____Key)){ScheduleStore[ChangeListenable____Key]=ChangeListenable[ChangeListenable____Key];}}var ____SuperProtoOfChangeListenable=ChangeListenable===null?null:ChangeListenable.prototype;ScheduleStore.prototype=Object.create(____SuperProtoOfChangeListenable);ScheduleStore.prototype.constructor=ScheduleStore;ScheduleStore.__superConstructor__=ChangeListenable;
    function ScheduleStore(initialData) {"use strict";
        ChangeListenable.call(this);
        this.$ScheduleStore_items = initialData.items;
        this.$ScheduleStore_ordering = window.localStorage['animeta.table.' + PERIOD + '.ordering'] || 'schedule';
        this.$ScheduleStore_containsKRSchedule = initialData.contains_kr_schedule;
        this.$ScheduleStore_sort();
    }

    ScheduleStore.prototype.getAllItems=function() {"use strict";
        return this.$ScheduleStore_items;
    };

    ScheduleStore.prototype.getOrdering=function() {"use strict";
        return this.$ScheduleStore_ordering;
    };

    ScheduleStore.prototype.setOrdering=function(ordering) {"use strict";
        this.$ScheduleStore_ordering = ordering;
        window.localStorage['animeta.table.' + PERIOD + '.ordering'] = ordering;
        this.$ScheduleStore_sort();
        this.emitChange();
    };

    ScheduleStore.prototype.$ScheduleStore_sort=function() {"use strict";
        this.$ScheduleStore_items.sort(comparatorMap[this.$ScheduleStore_ordering]);
    };

    ScheduleStore.prototype.containsKRSchedule=function() {"use strict";
        return this.$ScheduleStore_containsKRSchedule;
    };

    ScheduleStore.prototype.favoriteItem=function(item) {"use strict";
        return $.post('/api/v1/records', {
            work: item.title,
            status_type: 'interested'
        }).then(function(result)  {
            item.record = {
                id: result.record_id
            };
            item.record_count++;
            this.emitChange({
                event: 'favorite-added',
                title: item.title
            });
        }.bind(this));
    };


var scheduleStore = new ScheduleStore(APP_DATA);

function formatPeriod(period) {
    var parts = period.split('Q');
    var year = parts[0], quarter = parts[1];
    return year + '년 ' + [1, 4, 7, 10][quarter - 1] + '월';
}

var HeaderView = React.createClass({displayName: 'HeaderView',
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
        var switches = options.map(function(option)  {
            return React.DOM.span( {className:this.props.ordering == option.value ? 'active' : '',
                key:option.value,
                onClick:function()  {return scheduleStore.setOrdering(option.value);}}, option.label);
        }.bind(this));
        return (
            React.DOM.div( {className:"page-header"}, 
                React.DOM.div( {className:"settings"}, 
                    React.DOM.div( {className:"settings-item prefer-kr"}, 
                        React.DOM.label(null, "정렬: " ),
                        React.DOM.div( {className:"switch"}, 
                            switches
                        )
                    )
                ),
                React.DOM.h1( {className:"page-title"}, period, " 신작")
            )
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

var ItemPosterView = React.createClass({displayName: 'ItemPosterView',
    width: 233,
    height: 318,

    render: blazy ? function() {
        return React.DOM.img( {src:BLANK_IMG_URI, 'data-src':this.props.src,
            width:this.width, height:this.height, className:"item-poster b-lazy"} );
    } : function() {
        return React.DOM.img( {src:this.props.src, width:this.width, height:this.height, className:"item-poster"} );
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
                this.invalidation = setTimeout(function()  {
                    blazy.revalidate();
                    this.invalidation = null;
                }.bind(this), 0);
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

WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

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

var FavButton = React.createClass({displayName: 'FavButton',
    render: function() {
        return (
            React.DOM.label( {className:'btn-fav' + (this.props.active ? ' active' : ''),
                onClick:this.props.onClick}, 
                React.DOM.i( {className:"fa fa-check"}),
                ' ' + this.props.count
            )
        );
    }
});

var ItemView = React.createClass({displayName: 'ItemView',
    render: function() {
        var item = this.props.item;
        return (
            React.DOM.div( {className:"item"}, 
                React.DOM.div( {className:"item-inner"}, 
                    React.DOM.div( {className:"item-poster-wrap"}, 
                        ItemPosterView( {src:item.image_url} )
                    ),
                    React.DOM.div( {dangerouslySetInnerHTML:{__html: ItemView.template(this.getTemplateContext())}} ),
                    React.DOM.div( {className:"item-actions"}, 
                        FavButton( {active:item.record != null,
                            count:item.record_count,
                            onClick:this.handleFavButtonClick} )
                    )
                )
            )
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
        ['jp', 'kr'].forEach(function(country)  {
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

var NotificationView = React.createClass({displayName: 'NotificationView',
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
            update.timer = setTimeout(function()  {return this.setState({hidden: true});}.bind(this), timeout);
        this.setState(update);
    },

    render: function() {
        return (
            React.DOM.div( {className:"panel" + (this.state.hidden ? ' hidden' : '')}, 
                React.DOM.div( {className:"panel-inner"}, 
                this.state.message
                )
            )
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

var AppView = React.createClass({displayName: 'AppView',
    getInitialState: function() {
        return getAppViewState();
    },

    componentDidMount: function() {
        scheduleStore.addChangeListener(this._onChange);
        if (!USERNAME) {
            this.refs.notification.show([
                '관심 등록은 로그인 후 가능합니다. ',
                React.DOM.a( {href:getLoginURL(), className:"btn btn-login"}, "로그인")
            ]);
        }
    },

    componentWillUnmount: function() {
        scheduleStore.removeChangeListener(this._onChange);
    },

    render: function() {
        return (
            React.DOM.div(null, 
                HeaderView( {period:this.props.period,
                    ordering:this.state.ordering,
                    excludeKR:this.state.excludeKR} ),

                React.DOM.div( {className:"items"}, 
                this.state.items.map(function(item) 
                    {return ItemView( {item:item, key:item.id} );}
                )
                ),

                NotificationView( {ref:"notification"} )
            )
        );
    },

    _onChange: function(data) {
        this.setState(getAppViewState());
        if (data && data.event == 'favorite-added') {
            this.refs.notification.show(['관심 등록 완료 — ', React.DOM.b(null, data.title)], 3000);
        }
    }
});

React.renderComponent(
    AppView( {period:PERIOD} ),
    $('.anitable-container')[0]
);
