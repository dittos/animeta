require('moment').locale('ko');

var React = require('react');
var ReactDOMServer = require('react-dom/server');
var createLocation = require('history/lib/createLocation');
var Router = require('react-router');
var workRoutes = require('../js/work.react.js');
var indexRoutes = require('../js/index.react.js');
var PostApp = require('../js/post.react.js');

export default {
    work: createRoutesRenderer(workRoutes, true),
    index: createRoutesRenderer(indexRoutes),
    post: createSimpleRenderer(PostApp),
};

function createRoutesRenderer(routes, hashPatch) {
    return (path, preloadData) => {
        var markup;
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
            try {
                markup = ReactDOMServer.renderToString(<Router.RoutingContext {...renderProps} />);
            } finally {
                delete global.PreloadData;
            }
        });
        return markup;
    };
}

function createSimpleRenderer(Component) {
    return (path, preloadData) =>
        ReactDOMServer.renderToString(<Component PreloadData={preloadData} />);
}
