const webpack = require('webpack');
const MemoryFileSystem = require('memory-fs');
const {evalCode} = require('@animeta/web-frontend-server');

class CompilingAppProvider {
  constructor(webpackConfig) {
    this.compiler = webpack(webpackConfig);
    this.vfs = new MemoryFileSystem();
    this.compiler.outputFileSystem = this.vfs;
    this.bundleFilename = webpackConfig.output.filename;
  }

  start() {
    return new Promise((resolve, reject) => {
      this.compiler.run((err) => {
        if (err) {
          reject(err);
          return;
        }
        this.reloadApp();
        this.compiler.watch({}, () => {
          this.reloadApp();
        });
        resolve();
      });
    });
  }

  get() {
    if (!this.mod) {
      throw new Error('app is not compiled yet. did you call #start()?');
    }
    return this.mod;
  }

  reloadApp() {
    const code = this.vfs.readFileSync('/' + this.bundleFilename).toString('utf8');
    try {
      this.mod = evalCode(code);
    } catch (e) {
      console.error(e);
    }
  }
}

module.exports = {CompilingAppProvider};
