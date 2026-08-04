import { test, expect } from "../../src/fixtures/api.fixture.js";
import { env } from "../../src/config/env.js";
import { expectLiveSuccess } from "../../src/core/http/assertions.js";
import { labelTest } from "../../src/core/testing/allure.js";

const endpoints = [
  { name: "breeds list", path: "/breeds", params: { limit: 10 } },
  { name: "image search", path: "/images/search", params: { limit: 5 } },
  { name: "categories list", path: "/categories", params: { limit: 5 } },
];

for (const endpoint of endpoints) {
  test(`VADER Responsiveness: ${endpoint.name} meets the response budget`, async ({ api }) => {
    await labelTest({
      feature: "Non-functional quality",
      story: "VADER Responsiveness",
      risk: "medium",
      tags: ["responsiveness", "vader-responsiveness"],
    });

    const response = await api.get(endpoint.path, { params: endpoint.params, auth: "none" });
    expectLiveSuccess(response);
    expect(response.durationMs).toBeLessThan(env.RESPONSE_TIME_BUDGET_MS);
  });
}
