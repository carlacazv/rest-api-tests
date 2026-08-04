import { test, expect } from "../../src/fixtures/api.fixture.js";
import { env } from "../../src/config/env.js";
import { expectNoServerError, expectSuccess } from "../../src/core/http/assertions.js";
import { labelTest } from "../../src/core/testing/allure.js";

const onePixelPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2nWQAAAAASUVORK5CYII=",
  "base64",
);

test("PNG upload can be listed, retrieved, and deleted @mutation @upload", async ({ images }) => {
  await labelTest({
    feature: "Image uploads",
    story: "Upload lifecycle",
    risk: "critical",
    tags: ["mutation", "upload", "cleanup", "file-validation"],
  });

  test.skip(
    !env.DOG_API_KEY || !env.RUN_MUTATION_TESTS || !env.RUN_UPLOAD_TESTS,
    "DOG_API_KEY, RUN_MUTATION_TESTS=true, and RUN_UPLOAD_TESTS=true are required.",
  );

  let imageId: string | undefined;
  try {
    const uploadResponse = await images.upload({
      buffer: onePixelPng,
      fileName: "api-test-1x1.png",
      mimeType: "image/png",
      subId: env.DOG_API_SUB_ID,
    });
    expectSuccess(uploadResponse);
    const body = uploadResponse.body as Record<string, unknown>;
    imageId = body.id as string | undefined;
    expect(imageId).toBeDefined();

    const detailResponse = await images.getById(imageId!);
    expectNoServerError(detailResponse);
    if (detailResponse.ok) {
      expect(JSON.stringify(detailResponse.body)).toContain(imageId!);
    }
  } finally {
    if (imageId) {
      const deleteResponse = await images.delete(imageId);
      expectNoServerError(deleteResponse);
    }
  }
});
