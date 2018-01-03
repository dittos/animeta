var path = require('path');
var webpack = require('webpack');
var AssetsPlugin = require('assets-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

function styleLoader(env, loaders) {
    return ExtractTextPlugin.extract({
        fallback: 'style-loader',
        use: loaders,
    });
}

module.exports = (env) => {
    const config = {
        context: __dirname,
        entry: {
            index: './js/index.react.js',
            admin: './js/admin.react.js',
            common: './js/common.js',
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
                { test: /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)(\?.*)?$/, use: 'url-loader' },
                {
                    test: /\.less$/,
                    use: styleLoader(env, [
                        {
                            loader: 'css-loader',
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
        plugins: [
            new AssetsPlugin({
                path: __dirname,
                filename: 'assets.json',
            }),
            new ExtractTextPlugin('[name]-[contenthash].css'),
            new webpack.optimize.CommonsChunkPlugin({
                name: 'common',
                filename: 'common-[hash].js',
            }),
        ],
        devtool: env.prod ? 'source-map' : 'cheap-source-map',
    };
    if (env.prod) {
        config.plugins.push(
            new webpack.NormalModuleReplacementPlugin(
                /ReactErrorUtils$/, path.join(__dirname, 'js/ReactErrorUtils.js')
            ),
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
