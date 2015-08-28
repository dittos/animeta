var fs = require('fs');
var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var clientDefinePlugin = new webpack.DefinePlugin({
    'process.env.CLIENT': JSON.stringify(true),
});

module.exports = config = {
    plugins: [
        versionMapPlugin,
        clientDefinePlugin
    ],
    entry: {
        table_index: './frontend/js/table-index.react.js',
        table_period: './frontend/js/table-period.react.js',
        library: './frontend/js/library.react.js',
        work: './frontend/js/work.react.js',
        post: './frontend/js/post.react.js',
        index: './frontend/js/index.react.js',
        chart: './frontend/js/chart.react.js',
        common: './frontend/js/common.js'
    },
    output: {
        path: 'animeta/static/build',
        publicPath: '/static/build/',
        filename: '[name].js'
    },
    module: {
        loaders: [
            { test: /\.js[x]?$/, exclude: /node_modules/, loader: 'babel-loader' },
            { test: /\.less$/, loader: 'style!css!autoprefixer!less' },
            { test: /\.less\?extract$/, loader: ExtractTextPlugin.extract('style', 'css!autoprefixer!less') },
            { test: /\.(png|gif|svg)$/, loader: 'url' }
        ]
    }
};

function versionMapPlugin() {
    this.plugin('done', function(stats) {
        var assets = stats.toJson().assetsByChunkName;
        Object.keys(assets).forEach(function (key) {
            if (!Array.isArray(assets[key]))
                assets[key] = [assets[key]];
            var value = {};
            assets[key].forEach(function (name) {
                var ext = name.split('.').pop();
                if (ext == 'map')
                    return;
                value[ext] = name;
            });
            assets[key] = value;
        });
        var source = 'ASSET_FILENAMES = ' + JSON.stringify(assets);
        fs.writeFileSync(path.join(__dirname, 'animeta/assets.py'), source);
    });
}

if (process.env.NODE_ENV == 'production') {
    console.log('* Production Build');

    var moduleReplacePlugin = new webpack.NormalModuleReplacementPlugin(
        /ReactErrorUtils$/, __dirname + '/frontend/js/ReactErrorUtils.js'
    );

    var definePlugin = new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    });

    var uglifyPlugin = new webpack.optimize.UglifyJsPlugin();

    var commonsPlugin = new webpack.optimize.CommonsChunkPlugin('common', 'common-[hash].js');

    config.plugins = [
        moduleReplacePlugin,
        definePlugin,
        uglifyPlugin,
        commonsPlugin,
        new ExtractTextPlugin('[name]-[contenthash].css')
    ].concat(config.plugins);

    config.devtool = 'source-map';
    config.output.filename = '[name]-[hash].js';
} else {
    console.log('* Development Build');

    var commonsPlugin = new webpack.optimize.CommonsChunkPlugin('common', 'common.js');

    config.plugins = [
        commonsPlugin,
        new ExtractTextPlugin('[name].css')
    ].concat(config.plugins);
    config.devtool = 'cheap-source-map';
    config.module.postLoaders = [
        {
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'jshint'
        }
    ];
    config.jshint = {
        browser: true,
        es3: true,
        undef: true,
        unused: true,
        predef: ['_gaq', 'alert'],

        // Warnings
        "-W058": false, // new A;

        // Relaxing options
        eqnull: true,
        globalstrict: true,
        proto: true
    };
}
