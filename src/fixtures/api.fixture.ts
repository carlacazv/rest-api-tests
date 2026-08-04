import { test as base } from "@playwright/test";
import { env } from "../config/env.js";
import { ApiClient } from "../core/http/api-client.js";
import { BreedsClient } from "../domains/breeds/breeds.client.js";
import { CategoriesClient } from "../domains/categories/categories.client.js";
import { FactsClient } from "../domains/facts/facts.client.js";
import { FavouritesClient } from "../domains/favourites/favourites.client.js";
import { ImagesClient } from "../domains/images/images.client.js";
import { VotesClient } from "../domains/votes/votes.client.js";

interface ApiFixtures {
  api: ApiClient;
  breeds: BreedsClient;
  categories: CategoriesClient;
  facts: FactsClient;
  favourites: FavouritesClient;
  images: ImagesClient;
  votes: VotesClient;
}

export const test = base.extend<ApiFixtures>({
  api: async ({ request }, use) => {
    await use(new ApiClient(request, env.DOG_API_KEY));
  },
  breeds: async ({ api }, use) => {
    await use(new BreedsClient(api));
  },
  categories: async ({ api }, use) => {
    await use(new CategoriesClient(api));
  },
  facts: async ({ api }, use) => {
    await use(new FactsClient(api));
  },
  favourites: async ({ api }, use) => {
    await use(new FavouritesClient(api));
  },
  images: async ({ api }, use) => {
    await use(new ImagesClient(api));
  },
  votes: async ({ api }, use) => {
    await use(new VotesClient(api));
  },
});

export { expect } from "@playwright/test";
