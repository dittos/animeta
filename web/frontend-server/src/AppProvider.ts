import vm from 'vm';
import fs from 'fs';
import type { App } from 'nuri/app';
import type {render} from 'nuri/server';

export type AppModule = {
  app: App<any>;
  render: typeof render;
}

export interface AppProvider {
  get(): AppModule;
}

export class DefaultAppProvider implements AppProvider {
  private mod: AppModule;

  constructor(private bundlePath: string) {
  }

  get() {
    if (!this.mod) {
      const code = fs.readFileSync(this.bundlePath).toString('utf8');
      this.mod = evalCode(code);
    }
    return this.mod;
  }
}

export function evalCode(code: string): AppModule {
  const sandbox = {
    require,
    global: { Promise },
    module: { exports: <any>{} }
  };
  const context = vm.createContext(sandbox);
  const script = new vm.Script(code);
  script.runInContext(context);
  const appModule = sandbox.module.exports;
  return appModule.default || appModule;
}
