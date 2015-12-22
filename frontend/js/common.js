require('babel-polyfill');
require('react/addons');

var $ = require('jquery');
var moment = require('moment');
var CSRF = require('./CSRF');

moment.locale('ko');

function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}
$.ajaxSetup({
    beforeSend: function(xhr, settings) {
        if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
            xhr.setRequestHeader("X-CSRF-Token", CSRF.getToken());
        }
    }
});
