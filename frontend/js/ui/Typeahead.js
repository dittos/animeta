var _ = require('lodash');
var $ = require('jquery');
var React = require('react');
var ReactDOM = require('react-dom');
if (process.env.CLIENT) {
    var _jQuery = global.jQuery;
    global.jQuery = $;
    require('typeahead.js');
    global.jQuery = _jQuery;
}

function cachingSource(source, maxSize) {
    var cache = [];
    return function(q, cb) {
        for (var i = cache.length - 1; i >= 0; i--) {
            if (cache[i][0] == q) {
                cb(cache[i][1]);
                return;
            }
        }
        source(q, function(data) {
            cache.push([q, data]);
            if (cache.length >= maxSize) {
                cache.shift();
            }
            cb(data);
        });
    };
}

var searchSource = cachingSource(_.throttle(function (q, cb) {
    $.getJSON('/api/v2/search', {q: q}, cb);
}, 200), 20);

function init(node, viewOptions, sourceOptions) {
    return $(node).typeahead(viewOptions, sourceOptions);
}

function initSuggest(node) {
    return init(node, null, {
        source: cachingSource(_.throttle(function (q, cb) {
            $.getJSON('/api/v2/search/suggest', {q: q}, cb);
        }, 200), 20),
        displayKey: 'title',
        templates: templates
    });
}

var templates = {
    suggestion: function(item) {
        return ReactDOM.renderToStaticMarkup(<div>
            <span className="title">{item.title}</span>
            {' '}
            <span className="count">{item.n}명 기록</span>
        </div>);
    }
};

module.exports = {
    init,
    initSuggest,
    searchSource,
    templates
};
