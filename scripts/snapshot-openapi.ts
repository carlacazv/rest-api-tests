import { request } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { env } from "../src/config/env.js";
import { ApiClient } from "../src/core/http/api-client.js";
import { loadOpenApiSpec } from "../src/core/openapi/spec-loader.js";

const context = await request.newContext({
  extraHTTPHeaders: { Accept: "application/json", "User-Agent": "rest-api-tests/1.0" },
});

try {
  const api = new ApiClient(context, env.DOG_API_KEY);
  const spec = await loadOpenApiSpec(api, env.DOG_API_OPENAPI_URL);
  await mkdir("artifacts", { recursive: true });
  await writeFile("artifacts/openapi.json", `${JSON.stringify(spec, null, 2)}\n`, "utf8");
  console.log(`Saved OpenAPI ${spec.openapi} with ${Object.keys(spec.paths).length} paths.`);
} finally {
  await context.dispose();
}
