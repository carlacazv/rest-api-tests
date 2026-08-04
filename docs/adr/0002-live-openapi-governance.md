# ADR 0002: Govern Coverage from the Live OpenAPI Contract

- Status: Accepted
- Date: 2026-08-03

## Context

The provider can add operations independently of this repository. A hard-coded endpoint list would silently become incomplete.

## Decision

Fetch the live OpenAPI document during governance tests and coverage-report generation. Extract every operation, classify it, and fail when an operation has no test obligations.

## Consequences

- New endpoints are detected automatically.
- The suite depends on documentation availability.
- Positive execution remains risk-gated even when coverage classification is automatic.
