import { request } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { env } from "../src/config/env.js";
import { ApiClient } from "../src/core/http/api-client.js";
import { buildOperationCatalog } from "../src/core/openapi/catalog.js";
import { loadOpenApiSpec } from "../src/core/openapi/spec-loader.js";
import { classifyCoverage } from "../src/core/testing/coverage-policy.js";

const context = await request.newContext({
  extraHTTPHeaders: { Accept: "application/json", "User-Agent": "rest-api-tests/1.0" },
});

try {
  const api = new ApiClient(context, env.DOG_API_KEY);
  const spec = await loadOpenApiSpec(api, env.DOG_API_OPENAPI_URL);
  const coverage = buildOperationCatalog(spec).map(classifyCoverage);

  const markdown = [
    "# Generated Endpoint Coverage",
    "",
    `Generated from OpenAPI ${spec.openapi} at ${new Date().toISOString()}.`,
    "",
    "| Method | Path | Operation ID | Risk | Gate | Obligations and rationale |",
    "| --- | --- | --- | --- | --- | --- |",
    ...coverage.map(
      (item) =>
        `| ${item.operation.method.toUpperCase()} | \`${item.operation.path}\` | \`${item.operation.operationId}\` | ${item.risk.level} (${item.risk.score}): ${item.risk.rationale.join(" ")} | ${item.gate} | ${item.obligations.map((obligation) => `**${obligation}** — ${item.obligationRationale[obligation]}`).join("<br>")} |`,
    ),
    "",
  ].join("\n");

  const json = coverage.map((item) => ({
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

  await mkdir("artifacts", { recursive: true });
  await writeFile("artifacts/endpoint-coverage.md", `${markdown}\n`, "utf8");
  await writeFile("artifacts/endpoint-coverage.json", `${JSON.stringify(json, null, 2)}\n`, "utf8");
  console.log(`Classified ${coverage.length} OpenAPI operations.`);
} finally {
  await context.dispose();
}
