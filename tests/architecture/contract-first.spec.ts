import { test, expect } from "@playwright/test";
import { OperationHarness } from "../../src/alternatives/contract-first/operation-harness.js";
import { env } from "../../src/config/env.js";
import { ApiClient } from "../../src/core/http/api-client.js";
import { labelTest } from "../../src/core/testing/allure.js";

test("Contract-first comparison: safe operations are generated from OpenAPI", async ({
  request,
}, testInfo) => {
  await labelTest({
    feature: "Architecture comparison",
    story: "Pure contract-first generation",
    risk: "high",
    tags: ["architecture", "contract-first", "generated"],
  });

  const harness = await OperationHarness.fromLiveContract(
    new ApiClient(request, env.DOG_API_KEY),
    env.DOG_API_OPENAPI_URL,
  );
  const operations = harness.safeOperations().slice(0, env.MAX_OPENAPI_PROBES);
  const results: Array<Record<string, unknown>> = [];

  for (const operation of operations) {
    const execution = await harness.execute(operation);
    expect(execution.response.status, operation.operationId).toBeLessThan(500);
    expect.soft(execution.schemaIssues, operation.operationId).toEqual([]);
    results.push({
      operationId: operation.operationId,
      status: execution.response.status,
      schemaIssues: execution.schemaIssues,
    });
  }

  await testInfo.attach("contract-first-manifest.json", {
    body: Buffer.from(JSON.stringify(harness.manifest(), null, 2)),
    contentType: "application/json",
  });
  await testInfo.attach("contract-first-results.json", {
    body: Buffer.from(JSON.stringify(results, null, 2)),
    contentType: "application/json",
  });
});
