import webpack from 'webpack';
import MemoryFileSystem from 'memory-fs';
import { evalCode, AppProvider, AppModule } from '../core/AppProvider';

export class CompilingAppProvider implements AppProvider {
  private compiler: webpack.Compiler;
  private vfs: MemoryFileSystem;
  private bundleFilename: string;
  private mod: AppModule;

  constructor(webpackConfig: webpack.Configuration) {
    this.compiler = webpack(webpackConfig);
    this.vfs = new MemoryFileSystem();
    this.compiler.outputFileSystem = this.vfs;
    this.bundleFilename = webpackConfig.output.filename;
  }

  start(): Promise<void> {
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

  private reloadApp() {
    const code = this.vfs.readFileSync('/' + this.bundleFilename).toString('utf8');
    try {
      this.mod = evalCode(code);
    } catch (e) {
      console.error(e);
    }
  }
}
