var fs = require('fs');
var path = require('path');
var webpack = require('webpack');

module.exports = config = {
    plugins: [
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
        filename: '[name].js'
    },
    module: {
        loaders: [
            { test: /\.js$/, loader: 'jsx-loader?harmony' },
            { test: /\.less$/, loader: 'style!css!less' },
            { test: /\.png$/, loader: 'file' }
        ]
    }
};

if (process.env.NODE_ENV == 'production') {
    console.log('* Production Build');

    var moduleReplacePlugin = new webpack.NormalModuleReplacementPlugin(
        /ReactErrorUtils$/, __dirname + '/animeta/static/js/ReactErrorUtils.js'
    );

    var definePlugin = new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    });

    var uglifyPlugin = new webpack.optimize.UglifyJsPlugin();

    var commonsPlugin = new webpack.optimize.CommonsChunkPlugin('common', 'common-[hash].js');

    function versionMapPlugin() {
        this.plugin('done', function(stats) {
            var assets = stats.toJson().assetsByChunkName;
            for (var key in assets) {
                if (assets.hasOwnProperty(key) && Array.isArray(assets[key])) {
                    assets[key] = assets[key][0];
                }
            }
            var source = 'ASSET_FILENAMES = ' + JSON.stringify(assets);
            fs.writeFileSync(path.join(__dirname, 'animeta/assets.py'), source);
        });
    }

    config.plugins = [
        moduleReplacePlugin,
        definePlugin,
        uglifyPlugin,
        commonsPlugin
    ].concat(config.plugins);

    config.output.filename = '[name]-[hash].js';

    config.devtool = 'source-map';
} else {
    console.log('* Development Build');
}
