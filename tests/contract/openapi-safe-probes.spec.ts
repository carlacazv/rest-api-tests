import { test, expect } from "../../src/fixtures/api.fixture.js";
import { env } from "../../src/config/env.js";
import {
  buildOperationCatalog,
  isReadOnly,
  successSchema,
} from "../../src/core/openapi/catalog.js";
import { expectJsonWhenBodyExists, expectNoServerError } from "../../src/core/http/assertions.js";
import { buildOperationRequestSample } from "../../src/core/openapi/sample-data.js";
import { validateAgainstSchema } from "../../src/core/openapi/schema-validator.js";
import { loadOpenApiSpec } from "../../src/core/openapi/spec-loader.js";
import { labelTest } from "../../src/core/testing/allure.js";

const testTitle = "All documented read operations receive safe contract probes @contract";

test(testTitle, async ({ api }, testInfo) => {
  await labelTest({
    feature: "OpenAPI governance",
    story: "Safe generated probes",
    risk: "high",
    tags: ["contract", "generated", "vader-data", "vader-errors"],
  });

  const spec = await loadOpenApiSpec(api, env.DOG_API_OPENAPI_URL);
  const operations = buildOperationCatalog(spec)
    .filter(isReadOnly)
    .slice(0, env.MAX_OPENAPI_PROBES);
  const results: Array<Record<string, unknown>> = [];

  for (const operation of operations) {
    await test.step(`${operation.method.toUpperCase()} ${operation.path}`, async () => {
      const sample = buildOperationRequestSample(spec, operation);
      const response = await api.request(operation.method.toUpperCase() as "GET" | "HEAD", sample.path, {
        params: sample.params,
        auth: operation.security.length > 0 && !env.DOG_API_KEY ? "none" : "auto",
      });

      expectNoServerError(response, operation.operationId);

      let schemaIssues: unknown[] = [];
      if (response.ok) {
        expectJsonWhenBodyExists(response);
        const schema = successSchema(operation);
        if (schema) {
          schemaIssues = validateAgainstSchema(spec, schema, response.body);
          expect.soft(schemaIssues, operation.operationId).toEqual([]);
        }
      }

      results.push({
        operationId: operation.operationId,
        method: operation.method.toUpperCase(),
        path: operation.path,
        requestPath: sample.path,
        status: response.status,
        durationMs: Math.round(response.durationMs),
        schemaIssues,
      });
    });
  }

  await testInfo.attach("safe-probe-results.json", {
    body: Buffer.from(JSON.stringify(results, null, 2)),
    contentType: "application/json",
  });
});
