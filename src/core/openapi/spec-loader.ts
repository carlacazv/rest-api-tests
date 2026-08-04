import type { ApiClient } from "../http/api-client.js";
import { expectSuccess } from "../http/assertions.js";
import type { OpenApiDocument } from "./types.js";

export async function loadOpenApiSpec(
  api: ApiClient,
  url: string,
): Promise<OpenApiDocument> {
  const response = await api.get<OpenApiDocument>(url, { auth: "none" });
  expectSuccess(response, 200);

  if (!response.body || typeof response.body !== "object" || !("paths" in response.body)) {
    throw new Error("The OpenAPI endpoint did not return a valid document with paths.");
  }

  return response.body;
}
