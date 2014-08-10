/** @jsx React.DOM */

require('../less/table-index.less');

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

var Nav = React.createClass({
    render() {
        var tabs = [];
        for (var i = 0; i < WEEKDAYS.length; i++) {
            tabs.push(
                <span className={'tab' + (i == this.props.focusedIndex ? ' active' : '')}
                        key={'tab' + i}
                        onClick={(i => this.props.onDaySelect(i)).bind(null, i)}>
                    {WEEKDAYS[i]}
                </span>
            );
        }
        return (
            <div className="schedule-nav">
                <div className="schedule-nav-logo">
                    <a href="/">animeta</a>
                </div>
                <div className="schedule-nav-days">
                    {tabs}
                </div>
                <div className="schedule-nav-country">
                    <img src="/static/flag-jp.png" className={!this.props.preferKR ? 'active' : ''}
                        onClick={() => this.props.onCountrySelect('JP')} />{' '}
                    <img src="/static/flag-kr.png" className={this.props.preferKR ? 'active' : ''}
                        onClick={() => this.props.onCountrySelect('KR')} />
                </div>
            </div>
        );
    }
});

var STATUS_TYPES = {
    watching: '보는 중',
    finished: '완료',
    suspended: '중단',
    interested: '볼 예정'
};

var Item = React.createClass({
    render() {
        var item = this.props.item;
        var status;
        if (item.record) {
            status = <div className="item-status">
                {STATUS_TYPES[item.record.status_type]}
                {item.record.status ? ` (${item.record.status}화)` : null}
            </div>;
        }
        return (
            <div className="schedule-item">
                <div className="item-poster"><img src={item.image_url} /></div>
                <div className="item-schedule">
                    <span className="item-schedule-time">{WEEKDAYS[item.schedule.date.getDay()]} {item.schedule.time}</span>
                    {'/ '}
                    <span className="item-schedule-broadcasts">{item.schedule.broadcasts}</span>
                </div>
                <a href={getWorkURL(item)} className="item-title">{item.title}</a>
                {status}
            </div>
        );
    }
});

function groupItemsByWeekday(items, preferKR) {
    var groups = [];
    for (var i = 0; i < WEEKDAYS.length; i++) {
        groups.push({index: i, title: WEEKDAYS[i], items: []});
    }
    items.forEach(item => {
        item = deepCopy(item);
        item.schedule = item.schedule[preferKR ? 'kr' : 'jp'];
        if (item.schedule && item.schedule.date) {
            var date = new Date(item.schedule.date);
            item.schedule.date = date;
            item.schedule.time = getSimpleTime(date);
            groups[date.getDay()].items.push(item);
        }
    });
    groups.forEach(group => {
        group.items.sort(keyComparator(item => item.schedule.time));
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

var PositionSticky = React.createClass({
    mixins: [React.addons.PureRenderMixin],

    getInitialState() {
        return {sticky: false};
    },

    componentDidMount() {
        this.measure();
        $(window).scroll(this.handleScroll).resize(this.handleResize);
    },

    render() {
        var children = React.Children.map(this.props.children, child =>
            React.addons.cloneWithProps(child, {sticky: this.state.sticky})
        );
        if (!this.state.sticky) {
            return <div><div ref="content">{children}</div></div>;
        } else {
            return (
                <div>
                    <div ref="content" className="sticky"
                        style={{position: 'fixed', top: 0, left: this.state.left, right: this.state.right}}>
                        {children}
                    </div>
                    <div style={{height: this.state.height}} />
                </div>
            );
        }
    },

    handleScroll() {
        var nextSticky = $(window).scrollTop() > this._offsetTop;
        if (this.state.sticky != nextSticky) {
            this.setState({sticky: nextSticky});
        }
    },

    handleResize() {
        var wasSticky = this.state.sticky;
        this.setState({sticky: false}, () => {
            this.measure();
            this.setState({sticky: wasSticky});
        });
    },

    measure() {
        this._offsetTop = $(this.getDOMNode()).offset().top;

        var node = $(this.refs.content.getDOMNode());
        var left = node.position().left;
        var right = $('body').width() - (left + node.width());
        var height = node.height();
        this.setState({left: left, right: right, height: height});
    }
});

var Schedule = React.createClass({
    getInitialState() {
        return {
            focusedIndex: new Date().getDay(),
            preferKR: window.localStorage['animeta.table.preferKR']
        };
    },

    componentDidMount() {
        this.handleDaySelect(this.state.focusedIndex);
        $(window).scroll(this.handleScroll);
    },

    render() {
        var groups = groupItemsByWeekday(this.props.items, this.state.preferKR);
        var i = this.state.focusedIndex;
        return (
            <div className="schedule-container">
                <PositionSticky ref="nav">
                    <Nav focusedIndex={i} onDaySelect={this.handleDaySelect}
                        preferKR={this.state.preferKR} onCountrySelect={this.handleCountrySelect} />
                </PositionSticky>
                <div className="schedule-content" ref="content">
                {groups.map(group => 
                    <div className="schedule-day" ref={'group' + group.index}>
                        {group.items.map(item => <Item key={item.id} item={item} />)}
                    </div>
                )}
                </div>
            </div>
        );
    },

    handleDaySelect(i) {
        var $content = $(window);
        var scrollTop = 0;
        if (i > 0) {
            var $group = $(this.refs['group' + i].getDOMNode());
            var $nav = $(this.refs.nav.getDOMNode());
            scrollTop = Math.ceil($group.position().top - $nav.height());
        }
        $content.scrollTop(scrollTop);
        setTimeout(() => this.setState({focusedIndex: i}), SCROLL_DEBOUNCE * 2);
    },

    handleCountrySelect(country) {
        this.setState({preferKR: country == 'KR'}, () => {
            this.handleDaySelect(this.state.focusedIndex);
            window.localStorage['animeta.table.preferKR'] = this.state.preferKR;
        });
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
