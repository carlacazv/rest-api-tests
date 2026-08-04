import { defineConfig } from "@playwright/test";
import os from "node:os";
import { env } from "./src/config/env.js";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: env.TEST_WORKERS,
  timeout: env.TEST_TIMEOUT_MS,
  expect: {
    timeout: 5_000,
  },
  outputDir: "test-results",
  reporter: [
    ["line"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
    [
      "allure-playwright",
      {
        resultsDir: "allure-results",
        detail: true,
        suiteTitle: true,
        environmentInfo: {
          api_base_url: env.DOG_API_BASE_URL,
          node_version: process.version,
          os_platform: os.platform(),
          os_release: os.release(),
          mutation_tests: String(env.RUN_MUTATION_TESTS),
          upload_tests: String(env.RUN_UPLOAD_TESTS),
        },
      },
    ],
  ],
  use: {
    baseURL: env.DOG_API_BASE_URL,
    extraHTTPHeaders: {
      Accept: "application/json",
      "User-Agent": "rest-api-tests/1.0",
    },
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "public",
      grepInvert: /@authenticated|@mutation/,
    },
    {
      name: "authenticated",
      grep: /@authenticated/,
    },
    {
      name: "mutations",
      grep: /@mutation/,
      workers: 1,
      retries: 0,
    },
  ],
});
