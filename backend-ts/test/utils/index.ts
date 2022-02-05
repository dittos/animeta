import { getApp } from "./app";
import { TestUtils } from "./utils";

export { TestUtils } from "./utils";

export async function getTestUtils(): Promise<TestUtils> {
  const app = await getApp();
  const utils = app.get(TestUtils);
  utils.app = app;
  return utils;
}