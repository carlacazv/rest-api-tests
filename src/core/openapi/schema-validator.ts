import type { JsonSchema, OpenApiDocument } from "./types.js";
import { resolveSchema } from "./sample-data.js";

export interface SchemaIssue {
  path: string;
  message: string;
}

export function validateAgainstSchema(
  spec: OpenApiDocument,
  schema: JsonSchema,
  value: unknown,
  path = "$",
  depth = 0,
): SchemaIssue[] {
  if (depth > 20) {
    return [{ path, message: "Schema validation exceeded maximum reference depth." }];
  }

  const resolved = resolveSchema(spec, schema);

  if (value === null && resolved.nullable) {
    return [];
  }

  if (resolved.oneOf) {
    const variants = resolved.oneOf.map((variant) =>
      validateAgainstSchema(spec, variant, value, path, depth + 1),
    );
    return variants.some((issues) => issues.length === 0)
      ? []
      : [{ path, message: "Value did not match any oneOf schema." }];
  }

  if (resolved.anyOf) {
    const variants = resolved.anyOf.map((variant) =>
      validateAgainstSchema(spec, variant, value, path, depth + 1),
    );
    return variants.some((issues) => issues.length === 0)
      ? []
      : [{ path, message: "Value did not match any anyOf schema." }];
  }

  if (resolved.allOf) {
    return resolved.allOf.flatMap((member) =>
      validateAgainstSchema(spec, member, value, path, depth + 1),
    );
  }

  const issues: SchemaIssue[] = [];

  if (resolved.enum && !resolved.enum.some((item) => Object.is(item, value))) {
    issues.push({ path, message: `Value is not one of the documented enum values.` });
  }

  switch (resolved.type) {
    case "object": {
      if (!isRecord(value)) {
        return [{ path, message: "Expected an object." }];
      }
      for (const required of resolved.required ?? []) {
        if (!(required in value)) {
          issues.push({ path: `${path}.${required}`, message: "Required property is missing." });
        }
      }
      for (const [name, propertySchema] of Object.entries(resolved.properties ?? {})) {
        if (name in value) {
          issues.push(
            ...validateAgainstSchema(
              spec,
              propertySchema,
              value[name],
              `${path}.${name}`,
              depth + 1,
            ),
          );
        }
      }
      break;
    }
    case "array":
      if (!Array.isArray(value)) {
        return [{ path, message: "Expected an array." }];
      }
      if (resolved.items) {
        for (const [index, item] of value.entries()) {
          issues.push(
            ...validateAgainstSchema(spec, resolved.items, item, `${path}[${index}]`, depth + 1),
          );
        }
      }
      break;
    case "string":
      if (typeof value !== "string") {
        issues.push({ path, message: "Expected a string." });
      } else {
        if (resolved.minLength !== undefined && value.length < resolved.minLength) {
          issues.push({ path, message: `String is shorter than ${resolved.minLength}.` });
        }
        if (resolved.maxLength !== undefined && value.length > resolved.maxLength) {
          issues.push({ path, message: `String is longer than ${resolved.maxLength}.` });
        }
      }
      break;
    case "integer":
      if (typeof value !== "number" || !Number.isInteger(value)) {
        issues.push({ path, message: "Expected an integer." });
      }
      break;
    case "number":
      if (typeof value !== "number") {
        issues.push({ path, message: "Expected a number." });
      }
      break;
    case "boolean":
      if (typeof value !== "boolean") {
        issues.push({ path, message: "Expected a boolean." });
      }
      break;
  }

  if (typeof value === "number") {
    if (resolved.minimum !== undefined && value < resolved.minimum) {
      issues.push({ path, message: `Number is below minimum ${resolved.minimum}.` });
    }
    if (resolved.maximum !== undefined && value > resolved.maximum) {
      issues.push({ path, message: `Number is above maximum ${resolved.maximum}.` });
    }
  }

  return issues;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
