module.exports = {
    entry: {
        'table-index': './animeta/static/js/table-index.react.js',
        'table-period': './animeta/static/js/table-period.react.js'
    },
    output: {
        path: 'animeta/static/build',
        publicPath: '/static/build/',
        filename: '[name].react.js'
    },
    module: {
        loaders: [
            { test: /\.react\.js$/, loader: 'jsx-loader?harmony' },
            { test: /\.less$/, loader: 'style!css!less' },
            { test: /\.png$/, loader: 'file' }
        ]
    }
};
