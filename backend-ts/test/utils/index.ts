import { TestingModuleBuilder } from "@nestjs/testing";
import { getApp } from "./app";
import { TestUtils } from "./utils";

export { TestUtils } from "./utils";

export async function getTestUtils(testingModuleBuilderCustomizer: (tmb: TestingModuleBuilder) => TestingModuleBuilder = tmb => tmb): Promise<TestUtils> {
  const app = await getApp(testingModuleBuilderCustomizer);
  const utils = app.get(TestUtils);
  utils.app = app;
  return utils;
}