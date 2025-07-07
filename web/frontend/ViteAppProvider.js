const path = require('path');
const { readFileSync } = require('fs');
const {createServer: createViteServer} = require('vite');

class ViteAppProvider {
  constructor() {
  }

  async start() {
    this.vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom'
    });
    await this.reloadApp();
  }

  async getAssets(url) {
    return {
      index: {
        html: await this.vite.transformIndexHtml(url, readFileSync(path.join(__dirname, 'index.html'), 'utf8'))
      },
      admin: {
        html: await this.vite.transformIndexHtml(url, readFileSync(path.join(__dirname, 'index-admin.html'), 'utf8'))
      }
    };
  }

  get() {
    if (!this.mod) {
      throw new Error('app is not compiled yet. did you call #start()?');
    }
    return this.mod;
  }

  async reloadApp() {
    try {
      this.mod = await this.vite.ssrLoadModule('/js/serverEntry.ts');
    } catch (e) {
      console.error(e);
    }
  }
}

module.exports = {ViteAppProvider};
