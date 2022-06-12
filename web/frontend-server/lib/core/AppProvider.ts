import vm from 'vm';
import fs from 'fs';
import { App } from 'nuri/app';
import { InMemoryCacheConfig } from '@apollo/client';

export interface AppModule {
  default: App<any>;
  apolloCacheConfig: InMemoryCacheConfig;
}

export interface AppProvider {
  get(): AppModule;
}

export class DefaultAppProvider implements AppProvider {
  private app: AppModule;

  constructor(bundlePath: string) {
    const code = fs.readFileSync(bundlePath).toString('utf8');
    this.app = evalCode(code);
  }

  get() {
    return this.app;
  }
}

export function evalCode(code: string): AppModule {
  const sandbox = {
    require,
    module: { exports: <any>{} }
  };
  const context = vm.createContext(sandbox);
  const script = new vm.Script(code);
  script.runInContext(context);
  return sandbox.module.exports;
}
