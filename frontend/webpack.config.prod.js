var path = require('path');
var webpack = require('webpack');
var merge = require('webpack-merge');
var config = require('./webpack.config.common');

module.exports = merge(config, {
    plugins: [
        new webpack.NormalModuleReplacementPlugin(
            /ReactErrorUtils$/, path.join(__dirname, 'js/ReactErrorUtils.js')
        ),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production'),
        }),
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: true,
        }),
    ],
    devtool: 'source-map',
});
