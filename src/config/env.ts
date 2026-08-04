import "dotenv/config";
import { z } from "zod";

const booleanValue = z
  .enum(["true", "false"])
  .default("false")
  .transform((value) => value === "true");

const schema = z.object({
  DOG_API_ROOT: z.string().url().default("https://api.thedogapi.com"),
  DOG_API_BASE_URL: z.string().url().default("https://api.thedogapi.com/v1"),
  DOG_API_OPENAPI_URL: z.string().url().default("https://api.thedogapi.com/openapi-json"),
  DOG_API_KEY: z.string().min(1).optional(),
  DOG_API_SUB_ID: z.string().min(1).max(64).default("rest-api-tests"),
  RUN_MUTATION_TESTS: booleanValue,
  RUN_UPLOAD_TESTS: booleanValue,
  STRICT_PROVIDER_AVAILABILITY: booleanValue,
  TEST_WORKERS: z.coerce.number().int().min(1).max(16).default(4),
  TEST_TIMEOUT_MS: z.coerce.number().int().min(5_000).max(180_000).default(30_000),
  RESPONSE_TIME_BUDGET_MS: z.coerce.number().int().min(100).default(2_500),
  MAX_OPENAPI_PROBES: z.coerce.number().int().min(1).max(2_000).default(2_000),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");
  throw new Error(`Invalid environment configuration: ${details}`);
}

export const env = Object.freeze(parsed.data);
