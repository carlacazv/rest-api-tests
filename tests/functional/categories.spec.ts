import { test, expect } from "../../src/fixtures/api.fixture.js";
import { expectNoServerError, expectSuccess } from "../../src/core/http/assertions.js";
import { labelTest } from "../../src/core/testing/allure.js";

for (const row of [
  { name: "first page", limit: 5, page: 0 },
  { name: "single item minimum", limit: 1, page: 0 },
  { name: "later page", limit: 5, page: 1 },
]) {
  test(`Categories pagination partition: ${row.name}`, async ({ categories }) => {
    await labelTest({
      feature: "Categories",
      story: "Pagination",
      risk: "medium",
      tags: ["equivalence-partitioning", "boundary-value"],
    });

    const response = await categories.list(row.limit, row.page);
    expectSuccess(response);
    expect(Array.isArray(response.body)).toBe(true);
    expect((response.body as unknown[]).length).toBeLessThanOrEqual(row.limit);
  });
}

test("Invalid category pagination never causes a server error", async ({ categories }) => {
  await labelTest({
    feature: "Categories",
    story: "Invalid pagination",
    risk: "medium",
    tags: ["boundary-value", "vader-errors"],
  });

  const response = await categories.list(0, -1);
  expectNoServerError(response);
});
