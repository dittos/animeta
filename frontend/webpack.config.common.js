var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var AssetsPlugin = require('assets-webpack-plugin');

module.exports = {
    context: __dirname,
    plugins: [
        new AssetsPlugin({
            path: __dirname,
            filename: 'assets.json',
        }),
        new webpack.DefinePlugin({
            'process.env.CLIENT': JSON.stringify(true),
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'common',
            filename: 'common-[hash].js',
        }),
        new ExtractTextPlugin('[name]-[contenthash].css'),
    ],
    entry: {
        index: './js/index.react.js',
        admin: './js/admin.react.js',
        common: './js/common.js'
    },
    output: {
        path: path.join(__dirname, '../animeta/static/build'),
        publicPath: '/static/build/',
        filename: '[name]-[hash].js'
    },
    module: {
        rules: [
            {
                enforce: 'pre',
                test: /\.js$/,
                exclude: /node_modules/,
                use: 'eslint-loader',
            },
            { test: /\.js[x]?$/, exclude: /node_modules/, use: 'babel-loader' },
            { test: /\.json$/, use: 'json-loader' },
            { test: /\.less$/, use: ExtractTextPlugin.extract({
                fallback: 'style-loader',
                use: ['css-loader?localIdentName=[name]_[local]_[hash:base64:5]', 'autoprefixer-loader', 'less-loader'],
            }) },
            { test: /\.css$/, use: ExtractTextPlugin.extract({
                fallback: 'style-loader',
                use: ['css-loader', 'autoprefixer-loader'],
            }) },
            { test: /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)(\?.*)?$/, use: 'url-loader' }
        ]
    }
};
