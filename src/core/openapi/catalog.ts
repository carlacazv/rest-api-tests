import type {
  JsonSchema,
  OpenApiDocument,
  OpenApiOperation,
  OpenApiParameter,
  OpenApiPathItem,
  OpenApiResponse,
} from "./types.js";

const methods = ["get", "post", "put", "patch", "delete", "head", "options"] as const;
export type OperationMethod = (typeof methods)[number];

export interface ApiOperation {
  method: OperationMethod;
  path: string;
  operationId: string;
  summary: string;
  tags: string[];
  parameters: OpenApiParameter[];
  requestBodyContentTypes: string[];
  responses: Record<string, OpenApiResponse>;
  security: Array<Record<string, string[]>>;
  deprecated: boolean;
  raw: OpenApiOperation;
}

export function buildOperationCatalog(spec: OpenApiDocument): ApiOperation[] {
  const operations: ApiOperation[] = [];

  for (const [path, item] of Object.entries(spec.paths)) {
    for (const method of methods) {
      const operation = item[method];
      if (!operation) {
        continue;
      }

      operations.push({
        method,
        path,
        operationId: operation.operationId ?? `${method}:${path}`,
        summary: operation.summary ?? "Undocumented operation",
        tags: operation.tags ?? ["Untagged"],
        parameters: mergeParameters(item, operation),
        requestBodyContentTypes: Object.keys(operation.requestBody?.content ?? {}),
        responses: operation.responses ?? {},
        security: operation.security ?? spec.security ?? [],
        deprecated: operation.deprecated ?? false,
        raw: operation,
      });
    }
  }

  return operations.sort((left, right) =>
    `${left.path}:${left.method}`.localeCompare(`${right.path}:${right.method}`),
  );
}

export function isProtected(operation: ApiOperation): boolean {
  return operation.security.length > 0;
}

export function isReadOnly(operation: ApiOperation): boolean {
  return operation.method === "get" || operation.method === "head";
}

export function successResponse(operation: ApiOperation): OpenApiResponse | undefined {
  const explicit = Object.entries(operation.responses).find(([status]) => /^2\d\d$/.test(status));
  return explicit?.[1] ?? operation.responses.default;
}

export function successSchema(operation: ApiOperation): JsonSchema | undefined {
  const response = successResponse(operation);
  const json = response?.content?.["application/json"];
  return json?.schema;
}

function mergeParameters(item: OpenApiPathItem, operation: OpenApiOperation): OpenApiParameter[] {
  const merged = new Map<string, OpenApiParameter>();

  for (const parameter of [...(item.parameters ?? []), ...(operation.parameters ?? [])]) {
    merged.set(`${parameter.in}:${parameter.name}`, parameter);
  }

  return [...merged.values()];
}
