import { test } from "../../src/fixtures/api.fixture.js";
import { env } from "../../src/config/env.js";
import { buildOperationCatalog, isReadOnly } from "../../src/core/openapi/catalog.js";
import { expectNoServerError } from "../../src/core/http/assertions.js";
import { buildOperationRequestSample } from "../../src/core/openapi/sample-data.js";
import { loadOpenApiSpec } from "../../src/core/openapi/spec-loader.js";
import { labelTest } from "../../src/core/testing/allure.js";

test("All documented read-query boundaries fail safely @contract", async ({ api }, testInfo) => {
  await labelTest({
    feature: "OpenAPI governance",
    story: "Generated boundary values",
    risk: "high",
    tags: ["contract", "generated", "boundary-value", "vader-errors"],
  });

  const spec = await loadOpenApiSpec(api, env.DOG_API_OPENAPI_URL);
  const operations = buildOperationCatalog(spec).filter(isReadOnly);
  const results: Array<Record<string, unknown>> = [];
  let probes = 0;

  for (const operation of operations) {
    const sample = buildOperationRequestSample(spec, operation);
    for (const parameter of operation.parameters.filter(
      (item) => item.in === "query" && item.schema,
    )) {
      const values = outsideBoundaryValues(parameter.schema!);
      for (const value of values) {
        if (probes >= env.MAX_OPENAPI_PROBES) {
          break;
        }
        probes += 1;
        await test.step(`${operation.operationId}: ${parameter.name}=${String(value)}`, async () => {
          const response = await api.request(
            operation.method.toUpperCase() as "GET" | "HEAD",
            sample.path,
            {
              params: { ...sample.params, [parameter.name]: value },
              auth: operation.security.length > 0 && !env.DOG_API_KEY ? "none" : "auto",
            },
          );
          expectNoServerError(response, operation.operationId);
          results.push({
            operationId: operation.operationId,
            parameter: parameter.name,
            value,
            status: response.status,
          });
        });
      }
    }
  }

  await testInfo.attach("generated-boundary-results.json", {
    body: Buffer.from(JSON.stringify(results, null, 2)),
    contentType: "application/json",
  });
});

function outsideBoundaryValues(schema: {
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
}): Array<string | number> {
  const values: Array<string | number> = [];
  if (schema.minimum !== undefined) {
    values.push(schema.minimum - 1);
  }
  if (schema.maximum !== undefined) {
    values.push(schema.maximum + 1);
  }
  if (schema.minLength !== undefined) {
    values.push("x".repeat(Math.max(0, schema.minLength - 1)));
  }
  if (schema.maxLength !== undefined) {
    values.push("x".repeat(Math.min(schema.maxLength + 1, 10_000)));
  }
  return values;
}
