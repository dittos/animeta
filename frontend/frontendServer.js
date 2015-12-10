require('babel/polyfill');
require('babel/register');
require('moment').locale('ko');
var server = require('./server/frontend');

server.start(() => {
    console.log('Server running at:', server.info.uri);
});
