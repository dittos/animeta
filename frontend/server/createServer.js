var http = require('http');
var renderers = require('./renderers');

module.exports = function() {
    return http.createServer((req, res) => {
        var buf = '';
        req.on('data', data => {
            buf += data;
        });
        req.on('end', async () => {
            var view = req.url;
            var preloadData = JSON.parse(buf);
            var html = await renderers[view.substring(1)]('/', preloadData);
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(html);
            res.end();
        });
    });
};
