import { test } from "../../src/fixtures/api.fixture.js";
import { env } from "../../src/config/env.js";
import { buildOperationCatalog } from "../../src/core/openapi/catalog.js";
import { expectRejectedWithoutServerError } from "../../src/core/http/assertions.js";
import { buildOperationRequestSample } from "../../src/core/openapi/sample-data.js";
import { loadOpenApiSpec } from "../../src/core/openapi/spec-loader.js";
import { labelTest } from "../../src/core/testing/allure.js";

test("VADER Verbs: every documented path rejects TRACE safely @security", async ({
  api,
}, testInfo) => {
  await labelTest({
    feature: "Security",
    story: "VADER Verbs across the OpenAPI surface",
    risk: "high",
    tags: ["security", "generated", "vader-verbs"],
  });

  const spec = await loadOpenApiSpec(api, env.DOG_API_OPENAPI_URL);
  const uniquePaths = new Map(
    buildOperationCatalog(spec).map((operation) => [operation.path, operation]),
  );
  const results: Array<Record<string, unknown>> = [];

  for (const operation of [...uniquePaths.values()].slice(0, env.MAX_OPENAPI_PROBES)) {
    await test.step(`TRACE ${operation.path}`, async () => {
      const sample = buildOperationRequestSample(spec, operation);
      const response = await api.request("TRACE", sample.path, { auth: "none" });
      expectRejectedWithoutServerError(response);
      results.push({ path: operation.path, requestPath: sample.path, status: response.status });
    });
  }

  await testInfo.attach("trace-probe-results.json", {
    body: Buffer.from(JSON.stringify(results, null, 2)),
    contentType: "application/json",
  });
});
