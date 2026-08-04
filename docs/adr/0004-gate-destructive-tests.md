# ADR 0004: Gate Destructive and Quota-Consuming Tests

- Status: Accepted
- Date: 2026-08-03

## Context

Uploads, mutations, and AI analysis can create persistent data, consume quota, or incur cost. Running them on every pull request would be unsafe.

## Decision

Keep the default suite read-only. Require `DOG_API_KEY` and `RUN_MUTATION_TESTS=true` for lifecycle tests, plus `RUN_UPLOAD_TESTS=true` for uploads. Serialize mutation workers and clean created resources.

## Consequences

- Default CI is safe and repeatable.
- Full positive-path coverage requires an explicitly configured environment.
- Negative, contract, and validation coverage remains active for gated endpoints.
