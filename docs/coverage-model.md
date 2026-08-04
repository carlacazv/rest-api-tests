# Endpoint Coverage Model

Every operation discovered in the live OpenAPI specification is assigned automated obligations.

| Operation class | Required obligations |
| --- | --- |
| Read-only GET | valid probe, response contract, data partition, responsiveness, error handling |
| Protected read | missing-key and invalid-key rejection plus valid authenticated probe when a key exists |
| Mutation | authentication rejection, payload validation, lifecycle test when safely supported |
| Upload | authentication rejection, file-type and size partitions, lifecycle cleanup when explicitly enabled |
| Expensive analysis | authentication and validation coverage by default; positive execution only in an approved environment |
| Admin-only | authentication and authorization rejection; positive execution excluded without an authorized test account |

The generated report contains:

- method and path;
- operation ID and tags;
- security requirements;
- risk score;
- test obligations;
- execution gate;
- reason for any positive-path exclusion.

This model distinguishes **coverage** from **execution permission**. A risky endpoint can be covered by safe negative, validation, and contract tests even when a positive call is intentionally gated.

## Per-operation rationale

The generated `artifacts/endpoint-coverage.md` and JSON report explain, for every live OpenAPI operation, which obligations apply and why. This makes test-technique selection auditable rather than relying on undocumented tester judgment.
