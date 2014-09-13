var fs = require('fs');
var path = require('path');
var webpack = require('webpack');

var moduleReplacePlugin = new webpack.NormalModuleReplacementPlugin(
    /ReactErrorUtils$/, __dirname + '/animeta/static/js/ReactErrorUtils.js'
);

var definePlugin = new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
});

var commonsPlugin = new webpack.optimize.CommonsChunkPlugin('common', 'common-[hash].js');

function versionMapPlugin() {
    this.plugin('done', function(stats) {
        var source = 'ASSET_FILENAMES = ' + JSON.stringify(stats.toJson().assetsByChunkName);
        fs.writeFileSync(path.join(__dirname, 'animeta/assets.py'), source);
    });
}

module.exports = {
    plugins: [
        moduleReplacePlugin,
        definePlugin,
        commonsPlugin,
        versionMapPlugin
    ],
    entry: {
        table_index: './animeta/static/js/table-index.react.js',
        table_period: './animeta/static/js/table-period.react.js',
        library: './animeta/static/js/library.react.js',
        work: './animeta/static/js/work.react.js'
    },
    output: {
        path: 'animeta/static/build',
        publicPath: '/static/build/',
        filename: '[name]-[hash].js'
    },
    module: {
        loaders: [
            { test: /\.js$/, loader: 'jsx-loader?harmony' },
            { test: /\.less$/, loader: 'style!css!less' },
            { test: /\.png$/, loader: 'file' }
        ]
    }
};
