var webpack = require('webpack');

var moduleReplacePlugin = new webpack.NormalModuleReplacementPlugin(
    /ReactErrorUtils$/, __dirname + '/animeta/static/js/ReactErrorUtils.js'
);

var definePlugin = new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
});

var commonsPlugin = new webpack.optimize.CommonsChunkPlugin('common.js');

module.exports = {
    plugins: [
        moduleReplacePlugin,
        definePlugin,
        commonsPlugin
    ],
    entry: {
        'table-index': './animeta/static/js/table-index.react.js',
        'table-period': './animeta/static/js/table-period.react.js',
        'library': './animeta/static/js/library.react.js',
        'work': './animeta/static/js/work.react.js'
    },
    output: {
        path: 'animeta/static/build',
        publicPath: '/static/build/',
        filename: '[name].react.js'
    },
    module: {
        loaders: [
            { test: /\.js$/, loader: 'jsx-loader?harmony' },
            { test: /\.less$/, loader: 'style!css!less' },
            { test: /\.png$/, loader: 'file' }
        ]
    }
};
