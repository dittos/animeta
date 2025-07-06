var path = require('path');
var webpack = require('webpack');
var AssetsPlugin = require('assets-webpack-plugin');
var MiniCssExtractPlugin = require('mini-css-extract-plugin');
var ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
var TerserPlugin = require('terser-webpack-plugin');

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
    return ['webpack-hot-middleware/client?reload=true', ...(Array.isArray(entry) ? entry : [entry])];
  }
  return entry;
}

function cssLoader(env, modules) {
  return [
    {
      loader: 'css-loader',
      options: {
        localIdentName: '[name]_[local]_[hash:base64:5]',
        importLoaders: 1,
        modules,
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
  ]
}

module.exports = env => {
  const config = {
    mode: env.prod ? 'production' : 'development',
    context: __dirname,
    entry: env.server
      ? './js/serverEntry.ts'
      : {
          index: hot(env, ['babel-polyfill', './js/index.react.ts']),
          admin: hot(env, './js/admin.react.jsx'),
        },
    output: env.server
      ? {
          path: env.outputPath || path.join(__dirname, 'dist'),
          filename: 'bundle.server.js',
          libraryTarget: 'commonjs2',
        }
      : {
          path: path.join(__dirname, 'dist/static/build'),
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
        // IE11 compat
        {
          test: /(@wry\/.+|nanoid)\/.+\.[tj]s[x]?$/,
          include: /node_modules/,
          use: {
            loader: 'swc-loader',
          },
        },
        {
          test: /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)(\?.*)?$/,
          use: 'url-loader',
        },
        {
          test: /\.module\.less$/,
          use: styleLoader(env, cssLoader(env, 'local')),
        },
        {
          test: /\.less$/,
          exclude: /\.module\.less/,
          use: styleLoader(env, cssLoader(env, 'global')),
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
  config.optimization = {
    minimizer: [
      new TerserPlugin(),
    ],
  };
  if (env.server) {
    Object.assign(config, {
      target: 'node',
      node: false,
      // externals: [require('webpack-node-externals')()],
    });
    config.plugins.push(new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1
    }))
  } else {
    config.plugins.push(
      new AssetsPlugin({
        path: path.join(__dirname, 'dist'),
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
