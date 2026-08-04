# Architecture Comparison

| Criterion | Selected modular ports/adapters | Service Object | Screenplay | Pure generated contract-first |
| --- | --- | --- | --- | --- |
| Business readability | high | medium-high | high | low |
| Initial complexity | medium | low | high | medium |
| Large endpoint scalability | high | medium | high | very high |
| Stateful flow clarity | high | medium | very high | low |
| OpenAPI drift coverage | high | optional | optional | very high |
| Boilerplate | medium | low | high | low after generator setup |
| Best fit | mixed business and contract suite | small stable API | complex actors and workflows | broad schema conformance |

The selected architecture is the strongest overall fit because The Dog API combines many read endpoints, account-scoped state, uploads, and a changing OpenAPI contract. The alternative pull requests intentionally preserve the same test intent while changing structure so trade-offs are visible in code.
