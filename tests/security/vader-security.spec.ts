import { test, expect } from "../../src/fixtures/api.fixture.js";
import type { HttpMethod } from "../../src/core/http/api-client.js";
import { env } from "../../src/config/env.js";
import { buildOperationCatalog } from "../../src/core/openapi/catalog.js";
import {
  expectNoSensitiveErrorDisclosure,
  expectNoServerError,
  expectRejectedWithoutServerError,
} from "../../src/core/http/assertions.js";
import { buildOperationRequestSample } from "../../src/core/openapi/sample-data.js";
import { loadOpenApiSpec } from "../../src/core/openapi/spec-loader.js";
import { labelTest } from "../../src/core/testing/allure.js";

const unsupportedMethods = ["POST", "PUT", "PATCH", "DELETE"] as const;

for (const method of unsupportedMethods) {
  test(`VADER Verbs: ${method} is not accepted by the breeds collection @security`, async ({
    api,
  }) => {
    await labelTest({
      feature: "Security",
      story: "VADER Verbs",
      risk: "high",
      tags: ["security", "vader-verbs"],
    });

    const response = await api.request(method, "/breeds", { auth: "none", data: {} });
    expectRejectedWithoutServerError(response);
  });
}

test("VADER Authorization: protected operations reject missing and invalid credentials @security", async ({
  api,
}, testInfo) => {
  await labelTest({
    feature: "Security",
    story: "VADER Authorization",
    risk: "critical",
    tags: ["security", "authentication", "authorization"],
  });

  const spec = await loadOpenApiSpec(api, env.DOG_API_OPENAPI_URL);
  const protectedOperations = buildOperationCatalog(spec)
    .filter((operation) => operation.security.length > 0)
    .slice(0, env.MAX_OPENAPI_PROBES);
  const results: Array<Record<string, unknown>> = [];

  for (const operation of protectedOperations) {
    const sample = buildOperationRequestSample(spec, operation);
    for (const auth of ["none", "invalid"] as const) {
      await test.step(`${operation.method.toUpperCase()} ${operation.path} with ${auth} auth`, async () => {
        const response = await api.request(
          operation.method.toUpperCase() as HttpMethod,
          sample.path,
          {
            params: sample.params,
            auth,
            data: sample.data,
          },
        );
        expectRejectedWithoutServerError(response);
        expectNoSensitiveErrorDisclosure(response);

        results.push({
          operationId: operation.operationId,
          auth,
          status: response.status,
        });
      });
    }
  }

  await testInfo.attach("authorization-probe-results.json", {
    body: Buffer.from(JSON.stringify(results, null, 2)),
    contentType: "application/json",
  });
});

test("VADER Data and Errors: harmless injection markers do not disclose internals @security", async ({
  breeds,
}) => {
  await labelTest({
    feature: "Security",
    story: "VADER Data and Errors",
    risk: "high",
    tags: ["security", "input-validation", "error-disclosure"],
  });

  const markers = ["' OR '1'='1", "<script>alert(1)</script>", "../../etc/passwd", "${7*7}"];

  for (const marker of markers) {
    const response = await breeds.search(marker, { limit: 1 });
    expectNoServerError(response);
    expectNoSensitiveErrorDisclosure(response);
    expect(response.text).not.toContain("/usr/src/app");
  }
});

test("API key is never placed in a request URL @security", async ({ favourites }) => {
  await labelTest({
    feature: "Security",
    story: "Credential confidentiality",
    risk: "critical",
    tags: ["security", "secrets"],
  });

  test.skip(
    !env.DOG_API_KEY,
    "DOG_API_KEY is required for this authenticated confidentiality check.",
  );
  const response = await favourites.list({ limit: 1 });
  expect(response.url).not.toContain(env.DOG_API_KEY!);
  expect(response.text).not.toContain(env.DOG_API_KEY!);
});
