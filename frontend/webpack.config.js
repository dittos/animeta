var path = require('path');
var webpack = require('webpack');
var AssetsPlugin = require('assets-webpack-plugin');
var MiniCssExtractPlugin = require('mini-css-extract-plugin');
var ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

function styleLoader(env, loaders) {
  if (env.server) {
    return loaders;
  }
  if (env.prod) {
    return [MiniCssExtractPlugin.loader].concat(loaders);
  }
  return ['style-loader'].concat(loaders);
}

function hot(env, entry) {
  if (!env.prod && !env.server) {
    return ['webpack-hot-middleware/client?reload=true', entry];
  }
  return entry;
}

module.exports = env => {
  const config = {
    mode: env.prod ? 'production' : 'development',
    context: __dirname,
    entry: env.server
      ? './js/routes.js'
      : {
          index: hot(env, './js/index.react.js'),
          admin: hot(env, './js/admin.react.js'),
          common: hot(env, './js/common.js'),
        },
    output: env.server
      ? {
          path: env.outputPath || path.join(__dirname, '../frontend-server'),
          filename: 'bundle.js',
          libraryTarget: 'commonjs2',
        }
      : {
          path: path.join(__dirname, '../animeta/static/build'),
          publicPath: '/static/build/',
          filename: env.prod ? '[name]-[hash].js' : '[name].js',
          chunkFilename: env.prod ? '[name]-[hash].js' : '[name].js',
        },
    module: {
      rules: [
        {
          test: /\.[tj]s[x]?$/,
          exclude: /node_modules/,
          use: {
            loader: 'ts-loader',
            options: {
              transpileOnly: !env.prod,
            }
          },
        },
        {
          test: /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)(\?.*)?$/,
          use: 'url-loader',
        },
        {
          test: /\.less$/,
          use: styleLoader(env, [
            {
              loader: 'css-loader',
              options: {
                localIdentName: '[name]_[local]_[hash:base64:5]',
                importLoaders: 1,
                modules: 'global',
                exportOnlyLocals: env.server,
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                config: {
                  path: path.join(__dirname, 'postcss.config.js'),
                },
              },
            },
            'less-loader',
          ]),
        },
        {
          test: /\.css$/,
          use: styleLoader(env, [
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                config: {
                  path: path.join(__dirname, 'postcss.config.js'),
                },
              },
            },
          ]),
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
    plugins: [],
    devtool: env.prod ? 'source-map' : 'cheap-source-map',
  };
  if (env.server) {
    Object.assign(config, {
      target: 'node',
      node: false,
      externals: [require('webpack-node-externals')()],
    });
  } else {
    config.optimization = {
      runtimeChunk: 'single',
      splitChunks: {
        name: 'common',
      },
    };
    config.plugins.push(
      new AssetsPlugin({
        path: __dirname,
        filename: 'assets.json',
      })
    );
    if (env.prod) {
      config.plugins.push(new MiniCssExtractPlugin({
        filename: '[name]-[contenthash].css'
      }));
    } else {
      config.plugins.push(
        new webpack.HotModuleReplacementPlugin(),
        new ForkTsCheckerWebpackPlugin()
      );
    }
  }
  return config;
};
