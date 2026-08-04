import type { ApiOperation } from "../openapi/catalog.js";
import { isProtected, isReadOnly } from "../openapi/catalog.js";
import { assessOperationRisk, type RiskAssessment } from "./risk.js";

export type CoverageObligation =
  | "openapi-contract"
  | "safe-positive-probe"
  | "missing-auth"
  | "invalid-auth"
  | "equivalence-partitions"
  | "boundary-values"
  | "decision-table"
  | "error-contract"
  | "responsiveness"
  | "mutation-lifecycle"
  | "upload-lifecycle"
  | "manual-approved-environment";

export interface OperationCoverage {
  operation: ApiOperation;
  risk: RiskAssessment;
  obligations: CoverageObligation[];
  obligationRationale: Record<CoverageObligation, string>;
  gate: "default" | "api-key" | "mutation-flag" | "upload-flag" | "approved-environment";
  positiveExecution: boolean;
  reason?: string;
}

const obligationRationale: Record<CoverageObligation, string> = {
  "openapi-contract": "Detects provider contract drift for the operation.",
  "safe-positive-probe": "Confirms the documented read path is reachable without changing state.",
  "missing-auth": "Verifies protected behavior is not exposed anonymously.",
  "invalid-auth": "Verifies invalid credentials are rejected without leaking internals.",
  "equivalence-partitions": "Samples materially different input classes without redundant cases.",
  "boundary-values": "Targets defects at documented numeric and length limits.",
  "decision-table": "Covers outcomes controlled by combinations of parameters or state.",
  "error-contract": "Requires invalid requests to fail predictably and never as server errors.",
  responsiveness: "Checks that functional behavior remains usable within an explicit budget.",
  "mutation-lifecycle": "Validates state transitions and cleanup for write operations.",
  "upload-lifecycle": "Validates file handling, persistence, and deletion under an explicit safety gate.",
  "manual-approved-environment": "Prevents costly, administrative, or privacy-sensitive positive calls in shared environments.",
};

export function classifyCoverage(operation: ApiOperation): OperationCoverage {
  const obligations = new Set<CoverageObligation>([
    "openapi-contract",
    "error-contract",
    "equivalence-partitions",
  ]);
  const risk = assessOperationRisk(operation);
  let gate: OperationCoverage["gate"] = "default";
  let positiveExecution = false;
  let reason: string | undefined;

  if (operation.parameters.some((parameter) => hasBoundary(parameter.schema))) {
    obligations.add("boundary-values");
  }

  if (operation.parameters.length > 1) {
    obligations.add("decision-table");
  }

  if (isReadOnly(operation)) {
    obligations.add("safe-positive-probe");
    obligations.add("responsiveness");
    positiveExecution = true;
    if (isProtected(operation)) {
      gate = "api-key";
    }
  } else {
    obligations.add("mutation-lifecycle");
    gate = "mutation-flag";
    positiveExecution = true;
  }

  if (isProtected(operation)) {
    obligations.add("missing-auth");
    obligations.add("invalid-auth");
  }

  if (operation.requestBodyContentTypes.some((type) => type.includes("multipart"))) {
    obligations.add("upload-lifecycle");
    gate = "upload-flag";
  }

  if (
    operation.path.includes("/accounts/") ||
    operation.summary.toLowerCase().includes("admin") ||
    ["portrait", "genealogy", "body-condition", "estimated-age", "estimated-weight", "health-tips"].some(
      (fragment) => operation.path.includes(fragment),
    )
  ) {
    obligations.add("manual-approved-environment");
    gate = "approved-environment";
    positiveExecution = false;
    reason = "Positive execution is excluded by risk policy because the operation is administrative, expensive, or quota-intensive.";
  }

  return {
    operation,
    risk,
    obligations: [...obligations].sort(),
    obligationRationale,
    gate,
    positiveExecution,
    ...(reason === undefined ? {} : { reason }),
  };
}

function hasBoundary(schema: ApiOperation["parameters"][number]["schema"]): boolean {
  return Boolean(
    schema &&
      (schema.minimum !== undefined ||
        schema.maximum !== undefined ||
        schema.minLength !== undefined ||
        schema.maxLength !== undefined),
  );
}
