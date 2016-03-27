var fs = require('fs');
var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var AssetsPlugin = require('assets-webpack-plugin');

var clientDefinePlugin = new webpack.DefinePlugin({
    'process.env.CLIENT': JSON.stringify(true),
});

module.exports = config = {
    plugins: [
        new AssetsPlugin({filename: 'frontend/assets.json'}),
        clientDefinePlugin
    ],
    entry: {
        table_index: './frontend/js/table-index.react.js',
        library: './frontend/js/library.react.js',
        index: './frontend/js/index.react.js',
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
            { test: /\.json$/, loader: 'json-loader' },
            { test: /\.less$/, loader: ExtractTextPlugin.extract('style', 'css?localIdentName=[name]_[local]_[hash:base64:5]!autoprefixer!less') },
            { test: /\.css$/, loader: ExtractTextPlugin.extract('style', 'css!autoprefixer') },
            { test: /\.(png|gif|svg)$/, loader: 'url' }
        ]
    }
};

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
    config.module.preLoaders = [
        {
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'eslint-loader'
        }
    ];
}
