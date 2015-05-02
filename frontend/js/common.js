require('react/addons');

var $ = require('jquery');
var cookie = require('cookie');
var moment = require('moment');

moment.locale('ko');

function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}
$.ajaxSetup({
    beforeSend: function(xhr, settings) {
        if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
            var csrfToken = cookie.parse(document.cookie).csrftoken;
            xhr.setRequestHeader("X-CSRFToken", csrfToken);
        }
    }
});
