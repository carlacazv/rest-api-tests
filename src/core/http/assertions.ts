import { expect, test } from "@playwright/test";
import { env } from "../../config/env.js";
import type { ApiResponse } from "./api-client.js";

const KNOWN_PROVIDER_OUTAGE_MESSAGE =
  "The AI analysis service is temporarily unavailable. Please try again later.";
const KNOWN_FACTS_RANDOM_ROUTE_ERROR = "Cannot GET /facts/random";

interface ProviderAvailabilityIssue {
  annotationType: "provider-outage" | "provider-contract-defect";
  marker: string;
  reason: string;
}

export function expectNoServerError(response: ApiResponse, context?: string): void {
  expect(response.status, context ?? response.text).toBeLessThan(500);
}

export function expectSuccess(response: ApiResponse, expectedStatus?: number): void {
  if (expectedStatus !== undefined) {
    expect(response.status, response.text).toBe(expectedStatus);
    return;
  }

  expect(response.status, response.text).toBeGreaterThanOrEqual(200);
  expect(response.status, response.text).toBeLessThan(300);
}

export function expectLiveSuccess(response: ApiResponse, expectedStatus?: number): void {
  expectProviderRouteAvailable(response);
  expectSuccess(response, expectedStatus);
}

export function expectProviderRouteAvailable(response: ApiResponse): void {
  const issue = providerAvailabilityIssue(response);
  if (!issue) {
    return;
  }

  test.info().annotations.push({
    type: issue.annotationType,
    description: issue.reason,
  });
  test.fail(!env.STRICT_PROVIDER_AVAILABILITY, issue.reason);
  expect(response.text, issue.reason).not.toContain(issue.marker);
}

export function isKnownProviderOutage(response: ApiResponse): boolean {
  return response.status === 404 && response.text.includes(KNOWN_PROVIDER_OUTAGE_MESSAGE);
}

export function isKnownProviderContractDefect(response: ApiResponse): boolean {
  return (
    response.status === 404 &&
    response.text.includes('"path":"/facts/random') &&
    response.text.includes(KNOWN_FACTS_RANDOM_ROUTE_ERROR)
  );
}

export function expectJsonWhenBodyExists(response: ApiResponse): void {
  if (response.text.length === 0) {
    return;
  }

  expect(response.headers["content-type"] ?? "").toContain("application/json");
}

export function expectRejectedWithoutServerError(response: ApiResponse): void {
  expectNoServerError(response);
  expect(response.status, response.text).toBeGreaterThanOrEqual(400);
}

export function expectNoSensitiveErrorDisclosure(response: ApiResponse): void {
  const body = response.text.toLowerCase();
  const forbiddenMarkers = [
    "stack trace",
    "node_modules/",
    "syntaxerror:",
    "typeorm",
    "sequelize",
    "postgres",
    "mysql",
    "mongodb://",
    "aws_secret_access_key",
  ];

  for (const marker of forbiddenMarkers) {
    expect(body, `Error response disclosed internal marker: ${marker}`).not.toContain(marker);
  }
}

function providerAvailabilityIssue(response: ApiResponse): ProviderAvailabilityIssue | undefined {
  if (isKnownProviderOutage(response)) {
    return {
      annotationType: "provider-outage",
      marker: KNOWN_PROVIDER_OUTAGE_MESSAGE,
      reason:
        "The Dog API reported its known upstream analysis-service outage. Set STRICT_PROVIDER_AVAILABILITY=true to make this condition block shared CI.",
    };
  }

  if (isKnownProviderContractDefect(response)) {
    return {
      annotationType: "provider-contract-defect",
      marker: KNOWN_FACTS_RANDOM_ROUTE_ERROR,
      reason:
        "The live OpenAPI contract documents GET /facts/random, but the provider currently reports that the route does not exist. Set STRICT_PROVIDER_AVAILABILITY=true to make this contract defect block shared CI.",
    };
  }

  return undefined;
}
