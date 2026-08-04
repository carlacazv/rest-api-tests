import { rm } from "node:fs/promises";

for (const directory of [
  "allure-results",
  "allure-report",
  "playwright-report",
  "test-results",
  "artifacts",
]) {
  await rm(directory, { recursive: true, force: true });
}
