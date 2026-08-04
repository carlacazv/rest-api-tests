import { test, expect } from "../../src/alternatives/service-object/service-object.fixture.js";
import { expectLiveSuccess } from "../../src/core/http/assertions.js";
import { labelTest } from "../../src/core/testing/allure.js";
import { breedListSchema } from "../../src/domains/breeds/breeds.schemas.js";
import { imageListSchema } from "../../src/domains/images/images.schemas.js";

test("Service Object comparison: public resources remain readable", async ({ dogApi }) => {
  await labelTest({
    feature: "Architecture comparison",
    story: "Service Object",
    risk: "medium",
    tags: ["architecture", "service-object"],
  });

  const breeds = await dogApi.listBreeds(5);
  expectLiveSuccess(breeds);
  expect(breedListSchema.parse(breeds.body).length).toBeLessThanOrEqual(5);

  const images = await dogApi.searchImages(3, "ASC");
  expectLiveSuccess(images);
  expect(imageListSchema.parse(images.body).length).toBeLessThanOrEqual(3);
});
