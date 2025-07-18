import fs from 'fs';
import path from 'path';
import { AppModule, AppProvider } from './AppProvider';

export class ViteSSRAppProvider implements AppProvider {
  private mod: AppModule;
  private assets: any;

  constructor(private buildDir: string, private staticUrl: string = '/static') {
  }

  async start() {
    this.mod = await import(path.join(this.buildDir, 'server/serverEntry.mjs'))

    this.assets = {
      index: {
        html: fs.readFileSync(path.join(this.buildDir, 'static/index.html'), {encoding: 'utf8'})
          .replace(/__STATIC__/g, this.staticUrl)
          .replace(/(\.(js|css))/g, "$1?v=2"),
      },
      admin: {
        html: fs.readFileSync(path.join(this.buildDir, 'static/index-admin.html'), {encoding: 'utf8'})
          .replace(/__STATIC__/g, this.staticUrl)
          .replace(/(\.(js|css))/g, "$1?v=2"),
      },
    }
  }

  get() {
    return this.mod;
  }

  getAssets(): any {
    return this.assets;
  }
}
