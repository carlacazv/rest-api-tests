import { test, expect } from "../../src/fixtures/api.fixture.js";
import { expectNoServerError } from "../../src/core/http/assertions.js";
import { buildPairwiseCases } from "../../src/core/testing/pairwise.js";
import { labelTest } from "../../src/core/testing/allure.js";

const cases = buildPairwiseCases({
  order: ["ASC", "DESC", "RANDOM"] as const,
  size: ["small", "med", "full"] as const,
  hasBreeds: [true, false] as const,
  limit: [1, 5] as const,
});

for (const [index, row] of cases.entries()) {
  test(`Image search pairwise combination ${index + 1}`, async ({ images }) => {
    await labelTest({
      feature: "Images",
      story: "Pairwise filter interactions",
      risk: "high",
      tags: ["pairwise", "decision-table", "vader-data"],
    });

    const response = await images.search({
      order: row.order,
      size: row.size,
      has_breeds: row.hasBreeds,
      limit: row.limit,
    });
    expectNoServerError(response);
    if (response.ok) {
      expect(Array.isArray(response.body)).toBe(true);
      expect((response.body as unknown[]).length).toBeLessThanOrEqual(row.limit);
    }
  });
}
