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

var searchSource = cachingSource(debouncingSource(function (q, cb) {
    $.getJSON('/search/', {q: q}, cb);
}, 200), 20);
$('.global-search input').typeahead({highlight: true, hint: false}, {
    source: searchSource,
    displayKey: 'title',
    templates: {
        suggestion: function(item) {
            return '<span class="title">' + item.title + '</span> <span class="count">' + item.n + '명 기록</span>';
        }
    }
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

$(function () {
    $('#id_work_title, .autocomplete').autocomplete({
        source: function (request, callback) {
            $.getJSON('/search/suggest/', {q: request.term}, function (data) {
                callback($.map(data, function (work) { return work.title }))
            })
        }
    })

/*
    $('a.dialog').live('click', function() {
        if ($('#dialog').length == 0)
            $('<div id="dialog" style="display: none"></div>').appendTo('body')
        var url = this.getAttribute('href')
        $('#dialog').load(url, function (content) {
            var $dialog = $('#dialog')
            $dialog.find('form[action=""]').attr('action', url)
            $dialog.dialog()
        })
        return false
    })
*/
    
    function determine_suffix() {
        var status = $('#id_status');
        if (status.length == 0) return;
        if (status.val().match(/^(|.*\d)$/))
            $('#suffix').show()
        else
            $('#suffix').hide()
    }
    determine_suffix()
    $('#id_status').change(determine_suffix).keyup(determine_suffix)
})

function initServiceToggles(form) {
    var connectedServices = form.data('connected-services').split(' ');
    var twitterToggle = $('#id_publish_twitter', form);
    window.onTwitterConnect = function(ok) {
        if (ok) {
            connectedServices.push('twitter');
            twitterToggle[0].checked = true;
        } else {
            alert('연동 실패. 잠시 후 다시 시도해주세요.');
        }
    }
    twitterToggle.on('change', function() {
        if (this.checked && $.inArray('twitter', connectedServices) === -1) {
            window.open('/connect/twitter/?popup=true');
            this.checked = false;
        }
    });

    var facebookToggle = $('#id_publish_facebook', form);
    function tryEnableFacebook(silent) {
        var toggle = facebookToggle[0];
        toggle.checked = false;
        connectFacebook(function(response) {
            attachFacebookToken(response.authResponse.accessToken);
            toggle.checked = true;
        }, function() { }, silent);
    }
    facebookToggle.on('change', function() {
        if (this.checked)
            tryEnableFacebook(false);
    });
    var fbTokenField = null;
    function attachFacebookToken(token) {
        if (!fbTokenField) {
            fbTokenField = $('<input type="hidden" name="fb_token" />');
            $(form).append(fbTokenField);
        }
        fbTokenField.val(token);
    }
    function savePublishState() {
        if (!window.localStorage) return;
        window.localStorage['publishTwitter'] = twitterToggle[0].checked;
        window.localStorage['publishFacebook'] = facebookToggle[0].checked;
    }
    function restorePublishState() {
        if (!window.localStorage) return;
        if (window.localStorage['publishTwitter'] === 'true') {
            if ($.inArray('twitter', connectedServices) !== -1) {
                twitterToggle[0].checked = true;
            }
        }
        if (window.localStorage['publishFacebook'] === 'true') {
            tryEnableFacebook(true);
        }
    }

    restorePublishState();
    form.on('submit', function() {
        savePublishState();
    });
}

function connectFacebook(callback, errorCallback, silent) {
    window.fbInitCallbacks.push(function(FB) {
        FB.getLoginStatus(function(response) {
            if (response.status == 'connected') {
                callback(response);
            } else {
                if (silent) return;
                FB.login(function(response) {
                    if (response.authResponse) {
                        callback(response);
                    } else {
                        if (errorCallback)
                            errorCallback(response);
                    }
                }, {scope: 'publish_stream'});
            }
        });
    });
}

function initAutoGrow(input, minLength, maxLength) {
    var prevLength = 0;
    var timer = null;
    minLength = minLength || 3;
    maxLength = maxLength || 10;
    var update = function() {
        var currentLength = input.val().length;
        input.css('width', Math.max(minLength, Math.min(maxLength, currentLength)) + 'em');
        prevLength = currentLength;
    };
    input.on({
        focus: function() {
            timer = setInterval(function() {
                if (prevLength != input.val().length)
                    update();
            }, 50);
        },
        blur: function() {
            clearInterval(timer);
            timer = null;
        }
    });
    update();
}
