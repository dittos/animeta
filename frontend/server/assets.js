const getAssetKind = require('assets-webpack-plugin/lib/getAssetKind')
const isHMRUpdate = require('assets-webpack-plugin/lib/isHMRUpdate')
const isSourceMap = require('assets-webpack-plugin/lib/isSourceMap')

exports.getAssets = function(compiler, statsObj) {
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
};
