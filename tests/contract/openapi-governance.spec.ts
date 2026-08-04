import { test, expect } from "../../src/fixtures/api.fixture.js";
import { env } from "../../src/config/env.js";
import { buildOperationCatalog } from "../../src/core/openapi/catalog.js";
import { loadOpenApiSpec } from "../../src/core/openapi/spec-loader.js";
import { classifyCoverage } from "../../src/core/testing/coverage-policy.js";
import { labelTest } from "../../src/core/testing/allure.js";

const title = "OpenAPI contract is complete and every operation is classified @contract @smoke";

test(title, async ({ api }, testInfo) => {
  await labelTest({
    feature: "OpenAPI governance",
    story: "Endpoint coverage classification",
    risk: "critical",
    tags: ["contract", "openapi", "coverage"],
    description:
      "Fails when the provider adds an operation that cannot be assigned explicit test obligations.",
  });

  const spec = await loadOpenApiSpec(api, env.DOG_API_OPENAPI_URL);
  const operations = buildOperationCatalog(spec);
  const coverage = operations.map(classifyCoverage);

  expect(spec.openapi).toMatch(/^3\./);
  expect(operations.length).toBeGreaterThan(0);
  expect(new Set(operations.map((operation) => operation.operationId)).size).toBe(
    operations.length,
  );

  for (const item of coverage) {
    expect
      .soft(
        item.operation.responses,
        `${item.operation.method.toUpperCase()} ${item.operation.path}`,
      )
      .not.toEqual({});
    expect.soft(item.obligations.length, item.operation.operationId).toBeGreaterThan(0);
    expect.soft(item.risk.score, item.operation.operationId).toBeGreaterThan(0);
  }

  const report = coverage.map((item) => ({
    method: item.operation.method.toUpperCase(),
    path: item.operation.path,
    operationId: item.operation.operationId,
    tags: item.operation.tags,
    protected: item.operation.security.length > 0,
    risk: item.risk,
    obligations: item.obligations,
    gate: item.gate,
    positiveExecution: item.positiveExecution,
    obligationRationale: Object.fromEntries(
      item.obligations.map((obligation) => [obligation, item.obligationRationale[obligation]]),
    ),
    reason: item.reason,
  }));

  await testInfo.attach("endpoint-coverage.json", {
    body: Buffer.from(JSON.stringify(report, null, 2)),
    contentType: "application/json",
  });
});
