import { TestUtils } from './utils';

export { TestUtils } from './utils';
export { gql } from './testClient';
export * from './contract';

export async function getTestUtils(): Promise<TestUtils> {
  return new TestUtils();
}
