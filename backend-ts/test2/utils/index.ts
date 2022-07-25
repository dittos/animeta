import { getApp } from "./app";
import { TestUtils } from "./utils";

export { TestUtils } from "./utils";

export async function getTestUtils(): Promise<TestUtils> {
  const app = await getApp();
  const utils = new TestUtils(app);
  return utils;
}

export { gql } from 'graphql-tag';
