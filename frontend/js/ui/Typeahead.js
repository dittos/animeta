import throttle from 'lodash/throttle';
var $ = require('jquery');
require('../typeahead');

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

var searchSource = cachingSource(throttle(function (q, cb) {
    $.getJSON('/api/v2/search', {q: q}, cb);
}, 200), 20);

function init(node, viewOptions, sourceOptions) {
    return $(node).typeahead(viewOptions, sourceOptions);
}

function initSuggest(node) {
    return init(node, null, {
        source: cachingSource(throttle(function (q, cb) {
            $.getJSON('/api/v2/search/suggest', {q: q}, cb);
        }, 200), 20),
        displayKey: 'title',
        templates: templates
    });
}

var templates = {
    suggestion: function(item) {
        return $('<div />')
            .append($('<span class="title" />').text(item.title))
            .append(' ')
            .append($('<span class="count" />').text(item.n + '명 기록'))
            .html();
    }
};

module.exports = {
    init,
    initSuggest,
    searchSource,
    templates
};
