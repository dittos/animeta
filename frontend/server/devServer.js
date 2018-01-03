const express = require('express');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const {addEntry} = require('webpack-dev-server/lib/util');
const getAssetKind = require('assets-webpack-plugin/lib/getAssetKind')
const isHMRUpdate = require('assets-webpack-plugin/lib/isHMRUpdate')
const isSourceMap = require('assets-webpack-plugin/lib/isSourceMap')

function getAssets(compiler, statsObj) {
    // Copied from https://github.com/kossnocorp/assets-webpack-plugin/blob/master/index.js
    const stats = statsObj.toJson({
        hash: true,
        publicPath: true,
        assets: true,
        chunks: false,
        modules: false,
        source: false,
        errorDetails: false,
        timings: false
    });
    const options = compiler.options;
    var assetPath = stats.publicPath;
    // assetsByChunkName contains a hash with the bundle names and the produced files
    // e.g. { one: 'one-bundle.js', two: 'two-bundle.js' }
    // in some cases (when using a plugin or source maps) it might contain an array of produced files
    // e.g. {
    // main:
    //   [ 'index-bundle-42b6e1ec4fa8c5f0303e.js',
    //     'index-bundle-42b6e1ec4fa8c5f0303e.js.map' ]
    // }
    var assetsByChunkName = stats.assetsByChunkName

    var output = Object.keys(assetsByChunkName).reduce(function (chunkMap, chunkName) {
        var assets = assetsByChunkName[chunkName]
            if (!Array.isArray(assets)) {
                assets = [assets]
            }
        chunkMap[chunkName] = assets.reduce(function (typeMap, asset) {
            if (isHMRUpdate(options, asset) || isSourceMap(options, asset)) {
                return typeMap
            }

            var typeName = getAssetKind(options, asset)
                typeMap[typeName] = assetPath + asset

                return typeMap
        }, {})

        return chunkMap
    }, {})

    return output;
}

function nuriWebpackMiddleware(compiler, getApp) {
    var appPromise = new Promise((resolve, reject) => {
        compiler.run((err, stats) => {
            if (err) {
                reject(err);
            } else if (stats.hasErrors()) {
                reject(stats.toJson().errors);
            } else {
                resolve(getApp());
            }
        });
    });
    return (req, res, next) => {
        appPromise.then(nuriApp => {
            res.locals.nuriApp = nuriApp;
            next();
        }, err => next(err));
    };
}

const app = require('./frontend');
const webpackConfigFactory = require('../webpack.config.js');
const serverWebpackConfig = webpackConfigFactory({ server: true, prod: false });
const webpackConfig = webpackConfigFactory({ server: false, prod: false });
const serverCompiler = webpack(serverWebpackConfig);
const wdsOptions = {
    publicPath: '/static/build/',
    contentBase: false,
    host: 'localhost',
    port: 3000,
    inline: true,
    after(wdsApp, wds) {
        var assets;
        wds.on('compiler-done', (compiler, stats) => {
            assets = getAssets(compiler, stats);
        });
        wdsApp.use('/static', express.static(__dirname + '/../../animeta/static'));
        wdsApp.use(nuriWebpackMiddleware(serverCompiler, () => require('./bundle').default));
        wdsApp.use((req, res, next) => {
            res.locals.DEBUG = true;
            res.locals.assets = assets;
            next();
        });
        wdsApp.use(app);
    },
};
addEntry(webpackConfig, wdsOptions);
const compiler = webpack(webpackConfig);
new WebpackDevServer(compiler, wdsOptions).listen();
