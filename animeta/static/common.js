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

function debouncingSource(source, rate) {
    var timer = null;
    return function(q, cb) {
        if (timer) clearTimeout(timer);
        timer = setTimeout(function() {
            source(q, cb);
        }, rate);
    };
}

function openWork(title) {
    location.href = '/works/' + encodeURIComponent(title) + '/';
}

function escapeHTML(html) {
    return html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

var typeaheadTemplates = {
    suggestion: function(item) {
        return '<span class="title">' + escapeHTML(item.title) + '</span> <span class="count">' + item.n + '명 기록</span>';
    }
};

var searchSource = cachingSource(debouncingSource(function (q, cb) {
    $.getJSON('/search/', {q: q}, cb);
}, 200), 20);

$('.global-search input').typeahead({highlight: true, hint: false}, {
    source: searchSource,
    displayKey: 'title',
    templates: typeaheadTemplates
}).on('typeahead:selected', function(event, item) {
    openWork(item.title);
}).on('keypress', function(event) {
    if (event.keyCode == 13) {
        var self = this;
        var q = self.value;
        searchSource(q, function(data) {
            if (q != self.value || data.length == 0)
                return;
            if (data.filter(function(item) { return item.title == q; }).length == 1)
                openWork(q);
            else
                openWork(data[0].title);
        });
    }
});
