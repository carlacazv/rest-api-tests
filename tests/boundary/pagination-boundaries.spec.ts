import { test, expect } from "../../src/fixtures/api.fixture.js";
import { expectNoServerError } from "../../src/core/http/assertions.js";
import { numericBoundaryCases } from "../../src/core/testing/cases.js";
import { labelTest } from "../../src/core/testing/allure.js";

for (const boundary of numericBoundaryCases(1, 100)) {
  test(`Breed search limit boundary: ${boundary.name}`, async ({ breeds }) => {
    await labelTest({
      feature: "Cross-domain input validation",
      story: "Pagination boundaries",
      risk: "high",
      tags: ["boundary-value", boundary.position],
    });

    const response = await breeds.search("a", { limit: boundary.value });
    expectNoServerError(response);

    if (response.ok && Array.isArray(response.body) && boundary.value >= 1) {
      expect(response.body.length).toBeLessThanOrEqual(Math.min(boundary.value, 100));
    }
  });
}
