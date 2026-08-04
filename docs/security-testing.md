# Security Testing

The suite follows a safe subset of the OWASP API Security risk areas.

## Automated checks

- missing and invalid API key behavior;
- authorization boundaries for account-scoped resources;
- unsupported HTTP methods;
- malformed identifiers and payload types;
- harmless injection markers in query parameters;
- content-type validation;
- error responses without stack traces, SQL fragments, or framework internals;
- secret absence from URLs, bodies, logs, and Allure attachments;
- predictable handling of oversized and boundary inputs;
- rate-limit headers when exposed.

## Safety constraints

The suite does not brute force, flood, bypass authentication, exploit another user's data, or send destructive payloads. Mutation and upload tests operate only on records created by the current test run and always attempt cleanup.

## Authorization matrix

| Resource state          | No key | Invalid key | Valid key, own resource   | Valid key, unknown resource |
| ----------------------- | ------ | ----------- | ------------------------- | --------------------------- |
| Read account resource   | reject | reject      | allow                     | not found or reject         |
| Create account resource | reject | reject      | allow                     | not applicable              |
| Delete account resource | reject | reject      | allow and verify deletion | not found or reject         |

Positive cross-account authorization testing requires two dedicated provider-approved test accounts and is intentionally not simulated against real users.
