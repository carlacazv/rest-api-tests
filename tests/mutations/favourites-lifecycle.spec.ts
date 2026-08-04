import { test, expect } from "../../src/fixtures/api.fixture.js";
import { env } from "../../src/config/env.js";
import { expectNoServerError, expectSuccess } from "../../src/core/http/assertions.js";
import { imageListSchema } from "../../src/domains/images/images.schemas.js";
import { labelTest } from "../../src/core/testing/allure.js";

const title = "Favourite create-read-delete lifecycle is consistent @mutation";

test(title, async ({ favourites, images }) => {
  await labelTest({
    feature: "Favourites",
    story: "CRUD lifecycle",
    risk: "critical",
    tags: ["mutation", "crud", "cleanup"],
  });

  test.skip(!env.DOG_API_KEY || !env.RUN_MUTATION_TESTS, "DOG_API_KEY and RUN_MUTATION_TESTS=true are required.");

  const imageResponse = await images.search({ limit: 1 });
  expectSuccess(imageResponse);
  const image = imageListSchema.parse(imageResponse.body)[0];
  expect(image).toBeDefined();

  let favouriteId: string | number | undefined;
  try {
    const createResponse = await favourites.create(image!.id, env.DOG_API_SUB_ID);
    expectSuccess(createResponse);
    const body = createResponse.body as Record<string, unknown>;
    favouriteId = (body.id ?? body.favourite_id) as string | number | undefined;
    expect(favouriteId).toBeDefined();

    const readResponse = await favourites.getById(favouriteId!);
    expectNoServerError(readResponse);
    if (readResponse.ok) {
      expect(JSON.stringify(readResponse.body)).toContain(image!.id);
    }
  } finally {
    if (favouriteId !== undefined) {
      const deleteResponse = await favourites.delete(favouriteId);
      expectNoServerError(deleteResponse);
    }
  }

  const deletedResponse = await favourites.getById(favouriteId!);
  expectNoServerError(deletedResponse);
  expect(deletedResponse.status).toBeGreaterThanOrEqual(400);
});
