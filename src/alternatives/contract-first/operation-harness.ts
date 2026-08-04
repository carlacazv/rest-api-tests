import type { ApiClient, ApiResponse, HttpMethod } from "../../core/http/api-client.js";
import {
  buildOperationCatalog,
  isReadOnly,
  successSchema,
  type ApiOperation,
} from "../../core/openapi/catalog.js";
import { buildOperationRequestSample } from "../../core/openapi/sample-data.js";
import {
  validateAgainstSchema,
  type SchemaIssue,
} from "../../core/openapi/schema-validator.js";
import { loadOpenApiSpec } from "../../core/openapi/spec-loader.js";
import type { OpenApiDocument } from "../../core/openapi/types.js";
import { classifyCoverage } from "../../core/testing/coverage-policy.js";

export interface ContractExecution {
  operation: ApiOperation;
  response: ApiResponse;
  schemaIssues: SchemaIssue[];
}

export class OperationHarness {
  private constructor(
    private readonly api: ApiClient,
    private readonly spec: OpenApiDocument,
  ) {}

  public static async fromLiveContract(api: ApiClient, url: string): Promise<OperationHarness> {
    return new OperationHarness(api, await loadOpenApiSpec(api, url));
  }

  public safeOperations(): ApiOperation[] {
    return buildOperationCatalog(this.spec).filter(isReadOnly);
  }

  public manifest(): Array<Record<string, unknown>> {
    return buildOperationCatalog(this.spec).map((operation) => {
      const coverage = classifyCoverage(operation);
      return {
        operationId: operation.operationId,
        method: operation.method.toUpperCase(),
        path: operation.path,
        protected: operation.security.length > 0,
        risk: coverage.risk,
        obligations: coverage.obligations,
        gate: coverage.gate,
      };
    });
  }

  public async execute(operation: ApiOperation): Promise<ContractExecution> {
    const sample = buildOperationRequestSample(this.spec, operation);
    const response = await this.api.request(
      operation.method.toUpperCase() as HttpMethod,
      sample.path,
      {
        params: sample.params,
        auth: operation.security.length > 0 ? "none" : "auto",
      },
    );
    const schema = response.ok ? successSchema(operation) : undefined;

    return {
      operation,
      response,
      schemaIssues: schema ? validateAgainstSchema(this.spec, schema, response.body) : [],
    };
  }
}
