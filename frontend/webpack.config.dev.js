var merge = require('webpack-merge');
var config = require('./webpack.config.common');

module.exports = merge(config, {
    devtool: 'cheap-source-map',
});