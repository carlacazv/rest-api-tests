# The Dog API REST Test Automation

A production-style REST API test project for [The Dog API](https://docs.thedogapi.com/), built with Playwright, TypeScript, Allure Report, and mise.

## Why this architecture

The selected architecture is a **modular domain-oriented test architecture with ports and adapters**:

- Playwright's `APIRequestContext` is isolated behind a transport adapter.
- Domain clients express business intent instead of raw HTTP mechanics.
- Test design techniques are explicit and reusable.
- A live OpenAPI catalog governs endpoint coverage and detects undocumented drift.
- Destructive scenarios are separated, gated by environment variables, and cleaned up.

This is the best fit for a growing API because it balances maintainability, business readability, contract coverage, and safe parallel execution. See [`docs/architecture.md`](docs/architecture.md) and the ADRs in [`docs/adr`](docs/adr).

## Test design model

The suite applies:

- **VADER**: Verbs, Authorization, Data, Errors, and Responsiveness.
- **Equivalence partitioning**: valid, invalid, empty, unknown, and malformed input classes.
- **Boundary value analysis**: values immediately below, at, and above documented limits.
- **Decision tables and pairwise testing**: combinations of filters, authentication, and state transitions without unnecessary Cartesian explosion.
- **Risk-based testing**: business impact multiplied by failure likelihood determines depth and execution frequency.
- **Security testing**: authentication, authorization, verb tampering, injection-safe probes, sensitive-data leakage, error disclosure, and resource ownership checks.
- **CRUD and state-transition heuristics**: complete create/read/update/delete lifecycles where the API supports them.
- **OpenAPI differential coverage**: every documented operation is classified and receives at least one automated test obligation.

## Prerequisites

- mise
- Node.js 24 LTS
- Java 21 for Allure Report
- A The Dog API key for authenticated tests

## Setup

```bash
cp .env.example .env
mise install
mise run install
```

Set `DOG_API_KEY` in `.env` or in your shell. Never commit it.

## Run

```bash
mise run test
mise run test-contract
mise run test-security
mise run test-authenticated
```

Mutation tests are intentionally opt-in:

```bash
DOG_API_KEY=... RUN_MUTATION_TESTS=true mise run test-mutations
DOG_API_KEY=... RUN_MUTATION_TESTS=true RUN_UPLOAD_TESTS=true mise run test-uploads
```

Generate and open the Allure report:

```bash
mise run allure-generate
mise run allure-open
```

Generate the live endpoint coverage inventory:

```bash
mise run coverage-report
```

## Safety model

The default suite is read-only and non-destructive. Write, delete, upload, and AI-analysis endpoints are gated because they may consume quota, create persistent records, or trigger paid/expensive processing. Lifecycle tests use unique `sub_id` values and cleanup in `finally` blocks.

## Configuration

All deploy-varying configuration is provided through environment variables, following Twelve-Factor principles. See [`.env.example`](.env.example) and [`docs/twelve-factor-compliance.md`](docs/twelve-factor-compliance.md).

## CI and reports

GitHub Actions runs formatting, strict TypeScript checks, public tests, optional authenticated tests, and Allure generation. Test outputs are uploaded as workflow artifacts. Successful `main` runs publish the static Allure report to GitHub Pages.

## Architecture comparison pull requests

The repository intentionally keeps separate draft pull requests that refactor this same suite into alternative architectures:

1. Service Object architecture.
2. Screenplay architecture.
3. Pure contract-first generated architecture.

They remain open as educational comparisons. The architecture in `main` is the selected recommendation.
