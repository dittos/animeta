import vm from 'vm';
import fs from 'fs';
import { App } from 'nuri/app';

export interface AppProvider {
  get(): App<any>;
}

export class DefaultAppProvider implements AppProvider {
  private app: App<any>;

  constructor(bundlePath: string) {
    const code = fs.readFileSync(bundlePath).toString('utf8');
    this.app = evalCode(code);
  }

  get() {
    return this.app;
  }
}

export function evalCode(code: string): App<any> {
  const sandbox = {
    require,
    module: { exports: <any>{} }
  };
  const context = vm.createContext(sandbox);
  const script = new vm.Script(code);
  script.runInContext(context);
  const appModule = sandbox.module.exports;
  return appModule.default || appModule;
}
