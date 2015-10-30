require('babel/polyfill');
require('babel/register');
var server = require('./server/frontend');

server.start(() => {
    console.log('Server running at:', server.info.uri);
});
