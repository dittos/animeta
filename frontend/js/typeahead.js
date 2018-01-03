var $ = require('jquery');
if (typeof window !== 'undefined') {
    var _jQuery = window.jQuery;
    window.jQuery = $;
    require('typeahead.js');
    window.jQuery = _jQuery;
}