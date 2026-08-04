import { test, expect } from "../../src/fixtures/api.fixture.js";
import {
  expectLiveSuccess,
  expectNoServerError,
  expectProviderRouteAvailable,
} from "../../src/core/http/assertions.js";
import { imageListSchema, imageSchema } from "../../src/domains/images/images.schemas.js";
import { labelTest } from "../../src/core/testing/allure.js";

const decisionRows = [
  { name: "no filters", params: { limit: 3, order: "ASC" as const } },
  { name: "random order", params: { limit: 3, order: "RANDOM" as const } },
  { name: "images with breed metadata", params: { limit: 3, has_breeds: true } },
  { name: "small size representation", params: { limit: 3, size: "small" as const } },
];

for (const row of decisionRows) {
  test(`Image search decision row: ${row.name}`, async ({ images }) => {
    await labelTest({
      feature: "Images",
      story: "Search decision table",
      risk: "high",
      tags: ["decision-table", "vader-data"],
    });

    const response = await images.search(row.params);
    expectLiveSuccess(response);
    const parsed = imageListSchema.safeParse(response.body);
    expect(parsed.success, parsed.success ? "" : parsed.error.message).toBe(true);
    expect(Array.isArray(response.body) ? response.body.length : 0).toBeLessThanOrEqual(3);
  });
}

test("An image returned by search can be retrieved by ID", async ({ images }) => {
  await labelTest({
    feature: "Images",
    story: "Resource identity",
    risk: "high",
    tags: ["metamorphic", "crud-read"],
  });

  const searchResponse = await images.search({ limit: 1 });
  expectLiveSuccess(searchResponse);
  const list = imageListSchema.parse(searchResponse.body);
  const first = list[0];
  expect(first).toBeDefined();

  const detailResponse = await images.getById(first!.id);
  expectLiveSuccess(detailResponse);
  const detail = imageSchema.parse(detailResponse.body);
  expect(detail.id).toBe(first!.id);
  expect(detail.url).toBe(first!.url);
});

test("Unknown image ID is handled predictably", async ({ images }) => {
  await labelTest({
    feature: "Images",
    story: "Unknown resource error",
    risk: "medium",
    tags: ["equivalence-partitioning", "vader-errors"],
  });

  const response = await images.getById("unknown-image-id-for-api-tests");
  expectProviderRouteAvailable(response);
  expectNoServerError(response);
  expect(response.status).toBeGreaterThanOrEqual(400);
});
