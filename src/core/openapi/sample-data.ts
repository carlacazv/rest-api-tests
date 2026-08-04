import type { ApiOperation } from "./catalog.js";
import type { JsonSchema, OpenApiDocument, OpenApiParameter } from "./types.js";

export interface OperationRequestSample {
  path: string;
  params: Record<string, string | number | boolean>;
  data?: unknown;
  contentType?: string;
}

export function buildOperationRequestSample(
  spec: OpenApiDocument,
  operation: ApiOperation,
): OperationRequestSample {
  let path = operation.path;
  const params: Record<string, string | number | boolean> = {};

  for (const parameter of operation.parameters) {
    const value = sampleParameter(spec, parameter);
    if (parameter.in === "path") {
      path = path.replace(`{${parameter.name}}`, encodeURIComponent(String(value)));
    } else if (parameter.in === "query" && parameter.required) {
      params[parameter.name] = value;
    }
  }

  const contentType = operation.requestBodyContentTypes[0];
  const bodySchema = contentType
    ? operation.raw.requestBody?.content?.[contentType]?.schema
    : undefined;
  const data = bodySchema ? sampleSchema(spec, bodySchema) : undefined;

  return {
    path,
    params,
    ...(data === undefined ? {} : { data }),
    ...(contentType === undefined ? {} : { contentType }),
  };
}

export function sampleSchema(spec: OpenApiDocument, schema: JsonSchema, depth = 0): unknown {
  if (depth > 8) {
    return null;
  }

  const resolved = resolveSchema(spec, schema);

  if (resolved.example !== undefined) {
    return resolved.example;
  }
  if (resolved.default !== undefined) {
    return resolved.default;
  }
  if (resolved.enum && resolved.enum.length > 0) {
    return resolved.enum[0];
  }
  if (resolved.oneOf?.[0]) {
    return sampleSchema(spec, resolved.oneOf[0], depth + 1);
  }
  if (resolved.anyOf?.[0]) {
    return sampleSchema(spec, resolved.anyOf[0], depth + 1);
  }
  if (resolved.allOf) {
    return Object.assign(
      {},
      ...resolved.allOf.map((member) => sampleSchema(spec, member, depth + 1)),
    );
  }

  switch (resolved.type) {
    case "object":
      return Object.fromEntries(
        Object.entries(resolved.properties ?? {})
          .filter(([name]) => (resolved.required ?? []).includes(name))
          .map(([name, property]) => [name, sampleSchema(spec, property, depth + 1)]),
      );
    case "array":
      return resolved.items ? [sampleSchema(spec, resolved.items, depth + 1)] : [];
    case "integer":
    case "number":
      return resolved.minimum ?? 1;
    case "boolean":
      return true;
    case "string":
      if (resolved.format === "date") {
        return "2026-01-01";
      }
      if (resolved.format === "date-time") {
        return "2026-01-01T00:00:00.000Z";
      }
      if (resolved.format === "email") {
        return "api-tests@example.invalid";
      }
      return "test";
    case "null":
      return null;
    default:
      return "test";
  }
}

export function resolveSchema(spec: OpenApiDocument, schema: JsonSchema): JsonSchema {
  if (!schema.$ref) {
    return schema;
  }

  const match = schema.$ref.match(/^#\/components\/schemas\/(.+)$/);
  if (!match?.[1]) {
    return schema;
  }

  return spec.components?.schemas?.[match[1]] ?? schema;
}

function sampleParameter(
  spec: OpenApiDocument,
  parameter: OpenApiParameter,
): string | number | boolean {
  if (parameter.example !== undefined) {
    return primitive(parameter.example);
  }
  if (parameter.schema) {
    return primitive(sampleSchema(spec, parameter.schema));
  }

  return parameter.in === "path" ? "1" : "test";
}

function primitive(value: unknown): string | number | boolean {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }
  return JSON.stringify(value);
}
