import { test, expect } from "../../src/fixtures/api.fixture.js";
import { expectLiveSuccess } from "../../src/core/http/assertions.js";
import { labelTest } from "../../src/core/testing/allure.js";

for (const row of [
  { name: "minimum limit", params: { limit: 1, offset: 0 } },
  { name: "typical page", params: { limit: 10, offset: 0 } },
  { name: "maximum limit", params: { limit: 100, offset: 0 } },
  { name: "include sources", params: { limit: 2, include_sources: true } },
]) {
  test(`Facts boundary and partition: ${row.name}`, async ({ facts }) => {
    await labelTest({
      feature: "Facts",
      story: "Listing and filters",
      risk: "medium",
      tags: ["boundary-value", "equivalence-partitioning"],
    });

    const response = await facts.list(row.params);
    expectLiveSuccess(response);
    expect(Array.isArray(response.body)).toBe(true);
    expect((response.body as unknown[]).length).toBeLessThanOrEqual(row.params.limit);
  });
}

test("Random fact endpoint returns a stable response shape", async ({ facts }) => {
  await labelTest({
    feature: "Facts",
    story: "Random fact",
    risk: "low",
    tags: ["metamorphic", "schema"],
  });

  const response = await facts.random({ include_sources: false, lang: "en" });
  expectLiveSuccess(response);
  expect(typeof response.body).toBe("object");
  expect(response.body).not.toBeNull();
});
