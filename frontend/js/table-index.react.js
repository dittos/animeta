/* global PreloadData */
var React = require('react');
var util = require('./util');
var PositionSticky = require('./PositionSticky');
var LazyImageView = require('./LazyImage');
require('../less/table-index.less');

var SCROLL_DEBOUNCE = 20;

var appData = getInitialData();

function getInitialData() {
    return {
        period: PreloadData.period,
        currentUserName: PreloadData.username,
        items: PreloadData.schedule.items
    };
}

function getWorkURL(item) {
    return '/works/' + encodeURIComponent(item.title) + '/';
}

var WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

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
                    <img src={require('../img/flag-jp.png')} className={!this.props.preferKR ? 'active' : ''}
                        onClick={() => this.props.onCountrySelect('JP')} />{' '}
                    <img src={require('../img/flag-kr.png')} className={this.props.preferKR ? 'active' : ''}
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
                <div className="item-poster"><LazyImageView src={item.image_url} /></div>
                <div className="item-schedule">
                    <span className="item-schedule-time">
                        {WEEKDAYS[item.schedule.date.getDay()]}{' '}
                        {util.formatTime(item.schedule.date)}
                    </span>
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
        item = util.deepCopy(item);
        item.schedule = item.schedule[preferKR ? 'kr' : 'jp'];
        if (item.schedule && item.schedule.date) {
            var date = new Date(item.schedule.date);
            item.schedule.date = date;
            item.schedule.time = util.getTime(date);
            groups[date.getDay()].items.push(item);
        }
    });
    groups.forEach(group => {
        group.items.sort(util.keyComparator(item => item.schedule.time));
    });
    return groups;
}

var Schedule = React.createClass({
    getInitialState() {
        return {
            focusedIndex: new Date().getDay(),
            preferKR: window.localStorage['animeta.table.preferKR'] === 'true'
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

    handleScroll: util.debounce(function() {
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
        if (this.state.focusedIndex !== 0) {
            this.setState({focusedIndex: 0});
        }
    }, SCROLL_DEBOUNCE)
});

React.render(<Schedule {...appData} />, $('.anitable-container')[0]);
