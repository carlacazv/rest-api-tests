import { test as base } from "@playwright/test";
import { env } from "../../config/env.js";
import { ApiClient } from "../../core/http/api-client.js";
import { DogApiService } from "./dog-api.service.js";

interface ServiceObjectFixtures {
  dogApi: DogApiService;
}

export const test = base.extend<ServiceObjectFixtures>({
  dogApi: async ({ request }, use) => {
    const api = new ApiClient(request, env.DOG_API_KEY);
    await use(new DogApiService(api));
  },
});

export { expect } from "@playwright/test";
