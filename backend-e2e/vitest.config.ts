import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    globalSetup: './test/utils/globalSetup.ts',
    include: ['test/**/*.spec.ts'],
    fileParallelism: false,
    pool: 'forks',
    reporters: 'verbose',
  },
});
