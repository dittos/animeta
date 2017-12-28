var fs = require('fs');
var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var AssetsPlugin = require('assets-webpack-plugin');

var clientDefinePlugin = new webpack.DefinePlugin({
    'process.env.CLIENT': JSON.stringify(true),
});
var config;

module.exports = config = {
    context: __dirname + '/frontend',
    plugins: [
        new AssetsPlugin({filename: 'frontend/assets.json'}),
        clientDefinePlugin
    ],
    entry: {
        library: './js/library.react.js',
        index: './js/index.react.js',
        admin: './js/admin.react.js',
        common: './js/common.js'
    },
    output: {
        path: path.resolve(__dirname, 'animeta/static/build'),
        publicPath: '/static/build/',
        filename: '[name].js'
    },
    module: {
        rules: [
            { test: /\.js[x]?$/, exclude: /node_modules/, use: 'babel-loader' },
            { test: /\.json$/, use: 'json-loader' },
            { test: /\.less$/, use: ExtractTextPlugin.extract({fallback: 'style-loader', use: 'css-loader?localIdentName=[name]_[local]_[hash:base64:5]!autoprefixer-loader!less-loader'}) },
            { test: /\.css$/, use: ExtractTextPlugin.extract({fallback: 'style-loader', use: 'css-loader!autoprefixer-loader'}) },
            { test: /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)(\?.*)?$/, use: 'url-loader' }
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

    var commonsPlugin = new webpack.optimize.CommonsChunkPlugin({
        name: 'common',
        filename: 'common-[hash].js',
    });

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

    var commonsPlugin = new webpack.optimize.CommonsChunkPlugin({
        name: 'common',
        filename: 'common.js',
    });

    config.plugins = [
        commonsPlugin,
        new ExtractTextPlugin('[name].css')
    ].concat(config.plugins);
    config.devtool = 'cheap-source-map';
    config.module.rules.push({
        enforce: 'pre',
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'eslint-loader',
    });
}
