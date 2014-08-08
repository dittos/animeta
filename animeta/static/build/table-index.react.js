/** @jsx React.DOM */

var mountTarget = $('.anitable-container')[0];

var SCROLL_DEBOUNCE = 20;

var appData = getInitialData();

function getInitialData() {
    return {
        period: PERIOD,
        currentUserName: USERNAME,
        items: APP_DATA.items
    };
}

function deepCopy(obj) {
    return $.extend(/*deep:*/ true, {}, obj);
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

function zerofill(n) {
    n = String(n);
    if (n.length == 1)
        n = '0' + n;
    return n;
}

function getSimpleTime(date) {
    return zerofill(date.getHours()) + ':' + zerofill(date.getMinutes());
}

function getWorkURL(item) {
    return '/works/' + encodeURIComponent(item.title) + '/';
}

WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

var Nav = React.createClass({displayName: 'Nav',
    render: function() {
        var tabs = [];
        for (var i = 0; i < WEEKDAYS.length; i++) {
            tabs.push(
                React.DOM.span( {className:'tab' + (i == this.props.focusedIndex ? ' active' : ''),
                        key:'tab' + i,
                        onClick:(function(i)  {return this.props.onDaySelect(i);}.bind(this)).bind(null, i)}, 
                    WEEKDAYS[i]
                )
            );
        }
        return (
            React.DOM.div( {className:"schedule-nav"}, 
                React.DOM.div( {className:"schedule-nav-logo"}, 
                    React.DOM.a( {href:"/"}, "animeta")
                ),
                React.DOM.div( {className:"schedule-nav-days"}, 
                    tabs
                ),
                React.DOM.div( {className:"schedule-nav-country"}, 
                    React.DOM.img( {src:"/static/flag-jp.png", className:!this.props.preferKR ? 'active' : '',
                        onClick:function()  {return this.props.onCountrySelect('JP');}.bind(this)} ),' ',
                    React.DOM.img( {src:"/static/flag-kr.png", className:this.props.preferKR ? 'active' : '',
                        onClick:function()  {return this.props.onCountrySelect('KR');}.bind(this)} )
                )
            )
        );
    }
});

var STATUS_TYPES = {
    watching: '보는 중',
    finished: '완료',
    suspended: '중단',
    interested: '볼 예정'
};

var Item = React.createClass({displayName: 'Item',
    render: function() {
        var item = this.props.item;
        var status;
        if (item.record) {
            status = React.DOM.div( {className:"item-status"}, 
                STATUS_TYPES[item.record.status_type],
                item.record.status ? (" (" + item.record.status + "화)") : null
            );
        }
        return (
            React.DOM.div( {className:"schedule-item"}, 
                React.DOM.div( {className:"item-poster"}, React.DOM.img( {src:item.image_url} )),
                React.DOM.div( {className:"item-schedule"}, 
                    React.DOM.span( {className:"item-schedule-time"}, WEEKDAYS[item.schedule.date.getDay()], " ", item.schedule.time),
                    '/ ',
                    React.DOM.span( {className:"item-schedule-broadcasts"}, item.schedule.broadcasts)
                ),
                React.DOM.a( {href:getWorkURL(item), className:"item-title"}, item.title),
                status
            )
        );
    }
});

function groupItemsByWeekday(items, preferKR) {
    var groups = [];
    for (var i = 0; i < WEEKDAYS.length; i++) {
        groups.push({index: i, title: WEEKDAYS[i], items: []});
    }
    items.forEach(function(item)  {
        item = deepCopy(item);
        item.schedule = item.schedule[preferKR ? 'kr' : 'jp'];
        if (item.schedule && item.schedule.date) {
            var date = new Date(item.schedule.date);
            item.schedule.date = date;
            item.schedule.time = getSimpleTime(date);
            groups[date.getDay()].items.push(item);
        }
    });
    groups.forEach(function(group)  {
        group.items.sort(keyComparator(function(item)  {return item.schedule.time;}));
    });
    return groups;
}

function wrap(n, mod) {
    if (n >= 0)
        return n % mod;
    return n + mod;
}

function debounce(fn, t) {
    var timer;
    return function() {
        var self = this;
        if (timer) clearTimeout(timer);
        timer = setTimeout(function() {
            fn.call(self);
            timer = null;
        }, t);
    };
}

var PositionSticky = React.createClass({displayName: 'PositionSticky',
    mixins: [React.addons.PureRenderMixin],

    getInitialState: function() {
        return {sticky: false};
    },

    componentDidMount: function() {
        this.measure();
        $(window).scroll(this.handleScroll).resize(this.handleResize);
    },

    render: function() {
        var children = React.Children.map(this.props.children, function(child) 
            {return React.addons.cloneWithProps(child, {sticky: this.state.sticky});}.bind(this)
        );
        if (!this.state.sticky) {
            return React.DOM.div(null, React.DOM.div( {ref:"content"}, children));
        } else {
            return (
                React.DOM.div(null, 
                    React.DOM.div( {ref:"content", className:"sticky",
                        style:{position: 'fixed', top: 0, left: this.state.left, right: this.state.right}}, 
                        children
                    ),
                    React.DOM.div( {style:{height: this.state.height}} )
                )
            );
        }
    },

    handleScroll: function() {
        var nextSticky = $(window).scrollTop() > this._offsetTop;
        if (this.state.sticky != nextSticky) {
            this.setState({sticky: nextSticky});
        }
    },

    handleResize: function() {
        var wasSticky = this.state.sticky;
        this.setState({sticky: false}, function()  {
            this.measure();
            this.setState({sticky: wasSticky});
        }.bind(this));
    },

    measure: function() {
        this._offsetTop = $(this.getDOMNode()).offset().top;

        var node = $(this.refs.content.getDOMNode());
        var left = node.position().left;
        var right = $('body').width() - (left + node.width());
        var height = node.height();
        this.setState({left: left, right: right, height: height});
    }
});

var Schedule = React.createClass({displayName: 'Schedule',
    getInitialState: function() {
        return {
            focusedIndex: new Date().getDay(),
            preferKR: window.localStorage['animeta.table.preferKR']
        };
    },

    componentDidMount: function() {
        this.handleDaySelect(this.state.focusedIndex);
        $(window).scroll(this.handleScroll);
    },

    render: function() {
        var groups = groupItemsByWeekday(this.props.items, this.state.preferKR);
        var i = this.state.focusedIndex;
        return (
            React.DOM.div( {className:"schedule-container"}, 
                PositionSticky( {ref:"nav"}, 
                    Nav( {focusedIndex:i, onDaySelect:this.handleDaySelect,
                        preferKR:this.state.preferKR, onCountrySelect:this.handleCountrySelect} )
                ),
                React.DOM.div( {className:"schedule-content", ref:"content"}, 
                groups.map(function(group)  
                    {return React.DOM.div( {className:"schedule-day", ref:'group' + group.index}, 
                        group.items.map(function(item)  {return Item( {key:item.id, item:item} );})
                    );}
                )
                )
            )
        );
    },

    handleDaySelect: function(i) {
        var $content = $(window);
        var scrollTop = 0;
        if (i > 0) {
            var $group = $(this.refs['group' + i].getDOMNode());
            var $nav = $(this.refs.nav.getDOMNode());
            scrollTop = Math.ceil($group.position().top - $nav.height());
        }
        $content.scrollTop(scrollTop);
        setTimeout(function()  {return this.setState({focusedIndex: i});}.bind(this), SCROLL_DEBOUNCE * 2);
    },

    handleCountrySelect: function(country) {
        this.setState({preferKR: country == 'KR'}, function()  {
            this.handleDaySelect(this.state.focusedIndex);
            window.localStorage['animeta.table.preferKR'] = this.state.preferKR;
        }.bind(this));
    },

    handleScroll: debounce(function() {
        var $content = $(window);
        var $nav = $(this.refs.nav.getDOMNode());
        var contentOffset = $content.scrollTop() + $nav.height();
        for (var i = WEEKDAYS.length - 1; i >= 0; i--) {
            var $group = $(this.refs['group' + i].getDOMNode());
            if ($group.position().top <= contentOffset) {
                if (this.state.focusedIndex != i) {
                    this.setState({focusedIndex: i});
                }
                return;
            }
        }
        if (this.state.focusedIndex != 0) {
            this.setState({focusedIndex: 0});
        }
    }, SCROLL_DEBOUNCE)
});

React.renderComponent(Schedule(appData), mountTarget);
