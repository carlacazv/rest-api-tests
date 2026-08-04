import { test, expect } from "../../src/fixtures/api.fixture.js";
import { env } from "../../src/config/env.js";
import { expectNoServerError, expectSuccess } from "../../src/core/http/assertions.js";
import { imageListSchema } from "../../src/domains/images/images.schemas.js";
import { labelTest } from "../../src/core/testing/allure.js";

for (const value of [0, 1] as const) {
  test(`Vote lifecycle supports value ${value} @mutation`, async ({ images, votes }) => {
    await labelTest({
      feature: "Votes",
      story: "Decision table and CRUD lifecycle",
      risk: "critical",
      tags: ["mutation", "decision-table", "cleanup"],
    });

    test.skip(!env.DOG_API_KEY || !env.RUN_MUTATION_TESTS, "DOG_API_KEY and RUN_MUTATION_TESTS=true are required.");

    const imageResponse = await images.search({ limit: 1 });
    expectSuccess(imageResponse);
    const image = imageListSchema.parse(imageResponse.body)[0];
    expect(image).toBeDefined();

    let voteId: string | number | undefined;
    try {
      const createResponse = await votes.create(image!.id, value, env.DOG_API_SUB_ID);
      expectSuccess(createResponse);
      const body = createResponse.body as Record<string, unknown>;
      voteId = (body.id ?? body.vote_id) as string | number | undefined;
      expect(voteId).toBeDefined();

      const readResponse = await votes.getById(voteId!);
      expectNoServerError(readResponse);
      if (readResponse.ok) {
        expect(JSON.stringify(readResponse.body)).toContain(String(value));
      }
    } finally {
      if (voteId !== undefined) {
        const deleteResponse = await votes.delete(voteId);
        expectNoServerError(deleteResponse);
      }
    }
  });
}
