# ADR 0001: Use a Modular Ports-and-Adapters Test Architecture

- Status: Accepted
- Date: 2026-08-03

## Context

The API has multiple domains, public and authenticated operations, mutations, uploads, and a changing OpenAPI contract. A single test file or global service class would become difficult to maintain.

## Decision

Use domain modules for business intent and isolate Playwright transport behind `ApiClient`.

## Consequences

- Tests remain readable and transport-independent.
- New domains can be added without modifying unrelated clients.
- There is moderate initial structure and more files than a simple service-object suite.
