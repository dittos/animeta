import pgTestTeardown from '@databases/pg-test/jest/globalTeardown';

export default async function teardown(opts: any) {
  if (opts.watch || opts.watchAll) {
    // do not stop container to reuse on next run
    return
  }

  await pgTestTeardown()
}
