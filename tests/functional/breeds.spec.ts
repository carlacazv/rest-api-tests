import { test, expect } from "../../src/fixtures/api.fixture.js";
import {
  expectLiveSuccess,
  expectNoServerError,
} from "../../src/core/http/assertions.js";
import { breedListSchema, breedSchema } from "../../src/domains/breeds/breeds.schemas.js";
import { labelTest } from "../../src/core/testing/allure.js";

const searchPartitions = [
  { name: "valid partial name", query: "retr", expected: "success" },
  { name: "valid full name", query: "Labrador Retriever", expected: "success" },
  {
    name: "unknown well-formed name",
    query: "breed-that-does-not-exist-xyz",
    expected: "empty-or-reject",
  },
  { name: "single character boundary", query: "a", expected: "success" },
] as const;

test("List breeds returns a valid collection @smoke", async ({ breeds }) => {
  await labelTest({
    feature: "Breeds",
    story: "List breeds",
    risk: "high",
    tags: ["functional", "schema", "vader-data"],
  });

  const response = await breeds.list({ limit: 20, page: 0, order: "ASC" });
  expectLiveSuccess(response);
  const parsed = breedListSchema.safeParse(response.body);
  expect(parsed.success, parsed.success ? "" : parsed.error.message).toBe(true);
  expect(Array.isArray(response.body) ? response.body.length : 0).toBeLessThanOrEqual(20);
});

for (const partition of searchPartitions) {
  test(`Breed search equivalence partition: ${partition.name}`, async ({ breeds }) => {
    await labelTest({
      feature: "Breeds",
      story: "Search equivalence partitions",
      risk: "medium",
      tags: ["equivalence-partitioning", "vader-data"],
    });

    const response = await breeds.search(partition.query, { limit: 10 });
    if (partition.expected === "success") {
      expectLiveSuccess(response);
    } else {
      expectNoServerError(response);
    }

    if (response.ok) {
      const parsed = breedListSchema.safeParse(response.body);
      expect(parsed.success, parsed.success ? "" : parsed.error.message).toBe(true);
      expect(Array.isArray(response.body) ? response.body.length : 0).toBeLessThanOrEqual(10);
    }
  });
}

test("A breed returned by the list can be retrieved by ID", async ({ breeds }) => {
  await labelTest({
    feature: "Breeds",
    story: "Resource identity",
    risk: "high",
    tags: ["metamorphic", "crud-read"],
  });

  const listResponse = await breeds.list({ limit: 1 });
  expectLiveSuccess(listResponse);
  const list = breedListSchema.parse(listResponse.body);
  const first = list[0];
  expect(first).toBeDefined();

  const detailResponse = await breeds.getById(first!.id);
  expectLiveSuccess(detailResponse);
  const detail = breedSchema.parse(detailResponse.body);
  expect(String(detail.id)).toBe(String(first!.id));
  expect(detail.name).toBe(first!.name);
});
