// import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

const commonOptions = {
  plugins: [
    // typescript(),
    json(),
    commonjs({
      extensions: ['.js', '.ts'],
      // Some code in bundle.server.js require querystring module dynamically
      ignoreDynamicRequires: true,
    }),
    resolve({
      // https://github.com/uuidjs/uuid/issues/544
      exportConditions: ['node'],
    }),
  ],
  external: [
    'util',
  ],
}

export default [
  {
    input: 'dist/frontendServer.js',
    output: {
      file: 'dist/bundle.js',
      format: 'cjs',
    },
    ...commonOptions,
  },
  {
    input: 'dist/lambdaHandler.js',
    output: {
      file: 'dist/bundle-lambda.js',
      format: 'cjs',
    },
    ...commonOptions,
  },
]
