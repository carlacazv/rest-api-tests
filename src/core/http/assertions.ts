import { expect } from "@playwright/test";
import type { ApiResponse } from "./api-client.js";

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
