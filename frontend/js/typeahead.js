var $ = require('jquery');
if (process.env.CLIENT) {
    var _jQuery = global.jQuery;
    global.jQuery = $;
    require('typeahead.js');
    global.jQuery = _jQuery;
}