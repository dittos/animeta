var path = require('path');
var webpack = require('webpack');
var AssetsPlugin = require('assets-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

function styleLoader(env, loaders) {
    if (env.server) {
        return loaders;
    }
    if (env.prod) {
        return ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: loaders,
        });
    }
    return ['style-loader'].concat(loaders);
}

function hot(env, entry) {
    if (!env.prod && !env.server) {
        return ['webpack-hot-middleware/client?reload=true', entry];
    }
    return entry;
}

module.exports = (env) => {
    const config = {
        context: __dirname,
        entry: env.server ? './js/routes.js' : {
            index: hot(env, './js/index.react.js'),
            admin: hot(env, './js/admin.react.js'),
            common: hot(env, './js/common.js'),
        },
        output: env.server ? {
            path: env.outputPath || path.join(__dirname, '../frontend-dist'),
            filename: 'bundle.js',
            libraryTarget: 'commonjs2',
        } : {
            path: path.join(__dirname, '../animeta/static/build'),
            publicPath: '/static/build/',
            filename: env.prod ? '[name]-[hash].js' : '[name].js',
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
                { test: /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)(\?.*)?$/, use: 'url-loader' },
                {
                    test: /\.less$/,
                    use: styleLoader(env, [
                        {
                            loader: env.server ? 'css-loader/locals' : 'css-loader',
                            options: {
                                localIdentName: '[name]_[local]_[hash:base64:5]'
                            }
                        },
                        'autoprefixer-loader',
                        'less-loader',
                    ]),
                },
                {
                    test: /\.css$/,
                    use: styleLoader(env, ['css-loader', 'autoprefixer-loader']),
                },
            ]
        },
        plugins: [],
        devtool: env.prod ? 'source-map' : 'cheap-source-map',
    };
    if (env.server) {
        Object.assign(config, {
            target: 'node',
            node: false,
            externals: [
                require('webpack-node-externals')()
            ]
        });
    } else {
        config.plugins.push(
            new AssetsPlugin({
                path: __dirname,
                filename: 'assets.json',
            }),
            new webpack.optimize.CommonsChunkPlugin({
                name: 'common',
            })
        );
        if (env.prod) {
            config.plugins.push(
                new ExtractTextPlugin('[name]-[contenthash].css')
            );
        } else {
            config.plugins.push(
                new webpack.HotModuleReplacementPlugin()
            );
        }
    }
    if (env.prod) {
        config.plugins.push(
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify('production'),
            }),
            new webpack.optimize.UglifyJsPlugin({
                sourceMap: true,
            })
        );
    }
    return config;
};
