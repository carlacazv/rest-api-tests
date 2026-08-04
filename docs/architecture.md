# Architecture

## Selected model

The project uses a **modular domain-oriented architecture with ports and adapters**.

```text
Tests
  -> Domain clients
      -> API client port
          -> Playwright APIRequestContext adapter

OpenAPI governance
  -> Operation catalog
  -> Coverage policy
  -> Safe probes and contract validation
```

## Layers

### Tests

Tests contain intent, test design data, and assertions. They do not construct authentication headers or repeat transport code.

### Domain modules

Each API domain owns its client, response schemas, and reusable case data. This keeps changes localized and prevents a single oversized service class.

### Core HTTP adapter

`ApiClient` is the only component that knows Playwright transport details. It measures response time, parses JSON safely, applies authentication policy, and returns a normalized response.

### OpenAPI governance

The live OpenAPI document is treated as an external contract. The catalog extracts every operation, resolves example inputs, classifies risk, and produces coverage obligations. A governance test fails when an operation is missing required metadata or cannot be classified.

### Fixtures

Playwright fixtures compose the transport and domain clients. Tests receive ready-to-use objects, while configuration remains environment-driven.

## Why this model was selected

- It scales by API domain without creating a global god object.
- It keeps business tests readable.
- It enables transport replacement without rewriting scenarios.
- It supports parallel read-only tests and serialized mutation tests.
- It combines explicit business flows with automated OpenAPI drift detection.
- It produces a clear comparison point for the alternative architecture pull requests.

## Rejected as the primary model

### Service Object

Simple and familiar, but it tends to centralize too much behavior and becomes coupled as endpoint count grows.

### Screenplay

Excellent for complex multi-actor workflows, but creates unnecessary ceremony for most single-service API checks.

### Pure generated contract-first

Excellent for breadth and drift detection, but generated tests alone have weak business intent and often miss meaningful state transitions.
