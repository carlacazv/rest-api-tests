import type { ApiOperation } from "../openapi/catalog.js";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface RiskAssessment {
  likelihood: 1 | 2 | 3 | 4 | 5;
  impact: 1 | 2 | 3 | 4 | 5;
  score: number;
  level: RiskLevel;
  rationale: string[];
}

export function assessOperationRisk(operation: ApiOperation): RiskAssessment {
  const rationale: string[] = [];
  let likelihood: 1 | 2 | 3 | 4 | 5 = 2;
  let impact: 1 | 2 | 3 | 4 | 5 = 2;

  if (operation.method !== "get" && operation.method !== "head") {
    likelihood = 4;
    impact = 4;
    rationale.push("The operation changes state or accepts a complex payload.");
  }

  if (operation.security.length > 0) {
    impact = Math.max(impact, 4) as 4 | 5;
    rationale.push("The operation is protected and may expose account-scoped data.");
  }

  if (operation.requestBodyContentTypes.some((type) => type.includes("multipart"))) {
    likelihood = 5;
    impact = 4;
    rationale.push("File upload paths have validation, storage, and quota risks.");
  }

  if (operation.path.includes("admin") || operation.summary.toLowerCase().includes("admin")) {
    impact = 5;
    rationale.push("The operation is administrative.");
  }

  if (
    ["portrait", "genealogy", "body-condition", "estimated-age", "estimated-weight", "health-tips"].some(
      (fragment) => operation.path.includes(fragment),
    )
  ) {
    likelihood = 4;
    impact = 5;
    rationale.push("The operation may trigger quota-intensive or expensive analysis.");
  }

  if (rationale.length === 0) {
    rationale.push("The operation is read-only with limited direct account impact.");
  }

  const score = likelihood * impact;
  const level: RiskLevel = score >= 16 ? "critical" : score >= 9 ? "high" : score >= 4 ? "medium" : "low";

  return { likelihood, impact, score, level, rationale };
}
