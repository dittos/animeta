require('moment').locale('ko');

var React = require('react');
var ReactDOMServer = require('react-dom/server');
var createLocation = require('history/lib/createLocation');
var Router = require('react-router');
var workRoutes = require('../js/work.react.js');
var indexRoutes = require('../js/index.react.js');
var PostApp = require('../js/post.react.js');
var http = require('http');

var renderers = {
    '/work': createRoutesRenderer(workRoutes, true),
    '/index': createRoutesRenderer(indexRoutes),
    '/post': createSimpleRenderer(PostApp),
};

function createRoutesRenderer(routes, hashPatch) {
    return (path, preloadData) => new Promise((resolve, reject) => {
        var location = createLocation(path);

        Router.match({routes, location}, (error, redirectLocation, renderProps) => {
            if (hashPatch) {
                // Monkey patch makeHref to support hash-prefixed link
                var createHref = renderProps.history.createHref;
                renderProps.history.createHref = function(to, query) {
                    return '#' + createHref.call(this, to, query);
                };
            }

            global.PreloadData = preloadData;
            var markup;
            try {
                markup = ReactDOMServer.renderToString(<Router.RoutingContext {...renderProps} />);
            } finally {
                delete global.PreloadData;
            }
            resolve(markup);
        });
    });
}

function createSimpleRenderer(Component) {
    return (path, preloadData) => Promise.resolve(
        ReactDOMServer.renderToString(<Component PreloadData={preloadData} />)
    );
}

module.exports = function() {
    return http.createServer((req, res) => {
        var buf = '';
        req.on('data', data => {
            buf += data;
        });
        req.on('end', async () => {
            var view = req.url;
            var preloadData = JSON.parse(buf);
            var html = await renderers[view]('/', preloadData);
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(html);
            res.end();
        });
    });
};
