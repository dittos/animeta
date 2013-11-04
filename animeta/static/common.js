$(function () {
    $('#id_work_title, .autocomplete').autocomplete({
        source: function (request, callback) {
            $.getJSON('/api/v1/works', {match: 'prefix', sort: 'popular', count: 10, keyword: request.term}, function (data) {
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
    
    $('#suffix').after('<a href="#" id="plus-one"><img src="' + window.STATIC_URL + 'plus.gif" alt="+1" /></a>')
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
    $('#plus-one').click(function(event) {
        var $field = $('#id_status')
        var val = $field.val()
        var matches = val.match(/(\d+)[^\d]*$/)
        if (matches)
        {
            var digits = matches[1].length
            var add1 = (parseInt(matches[1], 10) + 1).toString()
            if (add1.length < digits)
                for (var i = 0; i < digits - add1.length; i++)
                    add1 = '0' + add1
            $field.val(val.replace(/(\d+)([^\d]*)$/, add1 + '$2'))
        }
        return false
    })
})

function initServiceToggles(form) {
    var connectedServices = form.data('connected-services').split(' ');
    var twitterToggle = $('#id_publish_twitter', form);
    var facebookToggle = $('#id_publish_facebook', form);
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
    facebookToggle.on('change', function() {
        var self = this;
        if (this.checked && $.inArray('facebook', connectedServices) === -1) {
            connectFacebook(function(response) {
                var req = $.post('/connect/facebook/', {token: response.authResponse.accessToken});
                req.success(function() {
                    connectedServices.push('facebook');
                });
                req.error(function() {
                    alert('연동 실패');
                    self.checked = false;
                });
            }, function(response) {
                self.checked = false;
            });
        }
    });
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
            if ($.inArray('facebook', connectedServices) !== -1) {
                facebookToggle[0].checked = true;
            }
        }
    }
    restorePublishState();
    form.on('submit', function() {
        savePublishState();
    });
}

function connectFacebook(callback, errorCallback) {
    window.fbInitCallbacks.push(function(FB) {
        FB.getLoginStatus(function(response) {
            if (response.status == 'connected') {
                callback(response);
            } else {
                FB.login(function(response) {
                    if (response.authResponse) {
                        callback(response);
                    } else {
                        if (errorCallback)
                            errorCallback(response);
                    }
                }, {scope: 'publish_stream,offline_access'});
            }
        });
    });
}
