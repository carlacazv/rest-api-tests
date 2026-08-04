import { test, expect } from "../../src/fixtures/api.fixture.js";
import { env } from "../../src/config/env.js";
import { expectNoServerError, expectSuccess } from "../../src/core/http/assertions.js";
import { labelTest } from "../../src/core/testing/allure.js";

const authenticatedTitle = "Authenticated account collections are readable @authenticated";

test(authenticatedTitle, async ({ favourites, votes }) => {
  await labelTest({
    feature: "Account resources",
    story: "Read-only authenticated access",
    risk: "critical",
    tags: ["authenticated", "authorization", "crud-read"],
  });

  test.skip(!env.DOG_API_KEY, "DOG_API_KEY is required for authenticated tests.");

  const favouriteResponse = await favourites.list({ limit: 5, sub_id: env.DOG_API_SUB_ID });
  expectNoServerError(favouriteResponse);
  if (favouriteResponse.status !== 404) {
    expectSuccess(favouriteResponse);
    expect(Array.isArray(favouriteResponse.body)).toBe(true);
  }

  const voteResponse = await votes.list({ limit: 5, sub_id: env.DOG_API_SUB_ID });
  expectNoServerError(voteResponse);
  if (voteResponse.status !== 404) {
    expectSuccess(voteResponse);
    expect(Array.isArray(voteResponse.body)).toBe(true);
  }
});
