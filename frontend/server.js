require('node-jsx').install({harmony: true});
require('object.assign').shim();
require('moment').locale('ko');

var React = require('react');
var Router = require('react-router');
var workRoutes = require('./js/work.react.js');
var IndexApp = require('./js/index.react.js');
var PostApp = require('./js/post.react.js');
var http = require('http');

var renderers = {
    '/work': renderWork,
    '/index': createSimpleRenderer(IndexApp),
    '/post': createSimpleRenderer(PostApp),
};

function renderWork(path, preloadData, next) {
    var router = Router.create({
        routes: workRoutes,
        location: path
    });

    // Monkey patch makeHref to support hash-prefixed link
    var makeHref = router.type.makeHref;
    router.type.makeHref = function(to, params, query) {
        return '#' + makeHref.call(this, to, params, query);
    };

    router.run(function(Handler) {
        next(React.renderToString(React.createElement(Handler, {
            PreloadData: preloadData
        })));
    });
}

function createSimpleRenderer(cls) {
    return function(path, preloadData, next) {
        next(React.renderToString(React.createElement(cls, {
            PreloadData: preloadData
        })));
    };
}

http.createServer(function(req, res) {
    var buf = '';
    req.on('data', function(data) {
        buf += data;
    });
    req.on('end', function() {
        var view = req.url;
        var preloadData = JSON.parse(buf);
        renderers[view]('/', preloadData, function(html) {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(html);
            res.end();
        });
    });
}).listen(process.env.PORT, '127.0.0.1');
