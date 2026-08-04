import * as allure from "allure-js-commons";
import type { RiskLevel } from "./risk.js";

const severityByRisk: Record<RiskLevel, "minor" | "normal" | "critical" | "blocker"> = {
  low: "minor",
  medium: "normal",
  high: "critical",
  critical: "blocker",
};

export async function labelTest(input: {
  epic?: string;
  feature: string;
  story: string;
  risk?: RiskLevel;
  tags?: string[];
  description?: string;
}): Promise<void> {
  await allure.epic(input.epic ?? "The Dog API");
  await allure.feature(input.feature);
  await allure.story(input.story);
  if (input.risk) {
    await allure.severity(severityByRisk[input.risk]);
  }
  if (input.tags?.length) {
    await allure.tags(...input.tags);
  }
  if (input.description) {
    await allure.description(input.description);
  }
}
