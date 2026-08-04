# Test Strategy

## Objective

Provide broad, maintainable, and safe coverage of every documented The Dog API operation while giving the highest depth to high-risk business behavior.

## Coverage pyramid

1. **OpenAPI governance** checks every documented operation, parameter, response declaration, and coverage classification.
2. **Safe generated probes** exercise read operations and protected-operation rejection without changing server state.
3. **Domain functional tests** validate business semantics for breeds, images, categories, facts, favourites, and votes.
4. **Lifecycle tests** validate create/read/delete flows with cleanup when explicitly enabled.
5. **Non-functional checks** cover responsiveness, error disclosure, and security-oriented behavior.

## VADER

VADER is used because it is a memorable REST API heuristic that prevents teams from focusing only on happy-path payload assertions.

| Area           | What is covered                                                          | Why                                                                     |
| -------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| Verbs          | supported and unsupported HTTP methods, idempotency expectations         | incorrect methods can cause unsafe or ambiguous behavior                |
| Authorization  | missing, invalid, and valid API keys; ownership boundaries               | access-control failures have high impact                                |
| Data           | schemas, types, formats, pagination, filters, payload sizes              | data-contract drift breaks consumers                                    |
| Errors         | status codes, stable messages, no stack traces, no 5xx for invalid input | predictable errors improve resilience and security                      |
| Responsiveness | endpoint budgets and slow-operation reporting                            | functional correctness is insufficient when responses are unusably slow |

## Equivalence partitioning

Inputs are grouped into classes expected to behave similarly:

- valid documented value;
- valid alternate value;
- empty or omitted value;
- unknown but well-formed value;
- malformed type or format;
- unauthorized identity.

One representative from each class reduces redundant tests while maintaining defect-finding power.

## Boundary value analysis

For every documented numeric or length constraint, tests target:

- minimum minus one;
- minimum;
- minimum plus one;
- maximum minus one;
- maximum;
- maximum plus one.

Assertions tolerate documented alternatives such as rejection or safe clamping, but never tolerate server errors.

## Decision tables

Decision tables are used when outcomes depend on combinations such as authentication, resource existence, filters, and mutation flags. They make missing combinations visible and executable.

## Risk-based testing

Risk score equals `likelihood x impact`, each from 1 to 5.

- 16-25: critical; run on every eligible change with deep lifecycle coverage.
- 9-15: high; run on every change with positive and negative coverage.
- 4-8: medium; run in the standard regression suite.
- 1-3: low; cover through contract probes or scheduled regression.

## Additional API heuristics

### CRUD

Where resources support lifecycle operations, tests cover create, read, update when available, and delete, including post-delete verification.

### State transitions

Tests validate allowed transitions and cleanup behavior rather than treating each endpoint as isolated.

### POISED

Parameters, Output, Interoperability, Security, Errors, and Data are used as a secondary review checklist. It overlaps with VADER but adds explicit attention to interoperability and parameter representation.

### Pairwise interaction testing

Pairwise generation covers every pair of values across multi-parameter filters while avoiding the full Cartesian explosion. It is used when decision tables have several independent factors, such as image order, size, breed metadata, and limit.

### Metamorphic checks

When an exact response is non-deterministic, tests assert stable relationships. Examples include result count not exceeding `limit`, the same image ID returning consistent identity fields, and ordering options preserving the same response shape.

## Out of scope by default

- destructive load or denial-of-service testing;
- brute-force authentication;
- paid or quota-intensive AI pet analysis;
- attempts to access another real user's private resources;
- assertions on volatile image ordering or random output identity.
