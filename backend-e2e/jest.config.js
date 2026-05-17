module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testEnvironment: 'node',
  testRegex: 'test/.*\\.spec\\.ts$',
  preset: 'ts-jest',
  globalSetup: '<rootDir>/test/utils/globalSetup.ts',
};
