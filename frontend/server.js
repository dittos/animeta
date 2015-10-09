require('babel/polyfill');
require('babel/register')({
    stage: 0,
    optional: ['es7.objectRestSpread']
});
var createServer = require('./server/createServer');
createServer().listen(process.env.PORT, '127.0.0.1');
