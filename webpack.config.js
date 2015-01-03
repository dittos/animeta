var fs = require('fs');
var path = require('path');
var webpack = require('webpack');

module.exports = config = {
    plugins: [
        versionMapPlugin
    ],
    entry: {
        table_index: './frontend/js/table-index.react.js',
        table_period: './frontend/js/table-period.react.js',
        library: './frontend/js/library.react.js',
        work: './frontend/js/work.react.js'
    },
    output: {
        path: 'animeta/static/build',
        publicPath: '/static/build/',
        filename: '[name].js'
    },
    module: {
        loaders: [
            { test: /\.js[x]?$/, loader: 'jsx-loader?harmony' },
            { test: /\.less$/, loader: 'style!css!autoprefixer!less' },
            { test: /\.(png|gif)$/, loader: 'url' }
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
} else {
    console.log('* Development Build');

    config.devtool = 'eval';
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
        predef: ['$', '_gaq', 'alert'],

        // Warnings
        "-W058": false, // new A;

        // Relaxing options
        eqnull: true
    };
}
