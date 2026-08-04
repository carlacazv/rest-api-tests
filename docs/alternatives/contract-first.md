# Alternative Architecture: Pure Contract-First Generation

## Intent

This branch treats the live OpenAPI document as the primary source of executable tests. An operation harness discovers, samples, executes, and validates operations with minimal hand-written domain code.

## Advantages

- Very broad endpoint coverage.
- New documented operations are discovered immediately.
- Low marginal cost per endpoint.
- Strong schema and drift detection.

## Costs

- Generated examples can be semantically weak.
- Business rules and state transitions are difficult to infer from schemas.
- Destructive operations require extensive allowlists and environment controls.
- Failures can be harder to understand than domain-named scenarios.

## Why it was not selected for `main`

The pure contract-first model is retained as a secondary layer in `main`, not the only architecture. The selected hybrid adds domain scenarios and explicit risk controls so broad contract coverage does not replace business intent.
