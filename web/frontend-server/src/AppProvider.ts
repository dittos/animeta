import vm from 'vm';
import fs from 'fs';
import type { App } from 'nuri/app';
import type {render} from 'nuri/server';
import path from 'path';

export type AppModule = {
  app: App<any>;
  render: typeof render;
}

export interface AppProvider {
  start(): Promise<void>;
  get(): AppModule;
  getAssets(url?: string): Promise<any> | any;
}

export class DefaultAppProvider implements AppProvider {
  private mod: AppModule;
  private assets: any;

  constructor(private buildDir: string) {
  }

  async start() {
    const bundlePath = path.join(this.buildDir, 'bundle.server.js');
    this.mod = evalCode(fs.readFileSync(bundlePath, 'utf8'));

    this.assets = JSON.parse(fs.readFileSync(path.join(process.env.ANIMETA_FRONTEND_DIST_PATH, 'assets.json'), {encoding: 'utf8'}));
  }

  get() {
    return this.mod;
  }

  getAssets(): any {
    return this.assets;
  }
}

export function evalCode(code: string): AppModule {
  const sandbox = {
    require,
    global: { Promise, Error },
    module: { exports: <any>{} }
  };
  const context = vm.createContext(sandbox);
  const script = new vm.Script(code);
  script.runInContext(context);
  const appModule = sandbox.module.exports;
  return appModule.default || appModule;
}
