import { test, expect } from "@playwright/test";
import {
  Actor,
  CallTheDogApi,
  ListDogBreeds,
  ResponseBody,
  ResponseStatus,
  SearchDogImages,
} from "../../src/alternatives/screenplay/screenplay.js";
import { env } from "../../src/config/env.js";
import { ApiClient } from "../../src/core/http/api-client.js";
import { expectLiveSuccess } from "../../src/core/http/assertions.js";
import { labelTest } from "../../src/core/testing/allure.js";
import { breedListSchema } from "../../src/domains/breeds/breeds.schemas.js";
import { imageListSchema } from "../../src/domains/images/images.schemas.js";

test("Screenplay comparison: an API consumer discovers dogs", async ({ request }) => {
  await labelTest({
    feature: "Architecture comparison",
    story: "Screenplay",
    risk: "medium",
    tags: ["architecture", "screenplay"],
  });

  const consumer = Actor.named("API consumer").whoCan(
    new CallTheDogApi(new ApiClient(request, env.DOG_API_KEY)),
  );

  const breedsResponse = await consumer.attemptsTo(new ListDogBreeds(5));
  expectLiveSuccess(breedsResponse);
  expect(await consumer.asks(new ResponseStatus(breedsResponse))).toBe(200);
  expect(
    breedListSchema.parse(await consumer.asks(new ResponseBody(breedsResponse))).length,
  ).toBeLessThanOrEqual(5);

  const imagesResponse = await consumer.attemptsTo(new SearchDogImages(3, "ASC"));
  expectLiveSuccess(imagesResponse);
  expect(await consumer.asks(new ResponseStatus(imagesResponse))).toBe(200);
  expect(
    imageListSchema.parse(await consumer.asks(new ResponseBody(imagesResponse))).length,
  ).toBeLessThanOrEqual(3);
});
