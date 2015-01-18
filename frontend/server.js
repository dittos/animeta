require('node-jsx').install({harmony: true});

var React = require('react');
var Router = require('react-router');
var routes = require('./js/work.react.js');
var http = require('http');

function render(path, preloadData, next) {
    var router = Router.create({
        routes: routes,
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

http.createServer(function(req, res) {
    var buf = '';
    req.on('data', function(data) {
        buf += data;
    });
    req.on('end', function() {
        var preloadData = JSON.parse(buf);
        render('/', preloadData, function(html) {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(html);
            res.end();
        });
    });
}).listen(process.env.PORT);
