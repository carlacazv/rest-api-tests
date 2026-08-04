# Alternative Architecture: Screenplay

## Intent

This branch models API interactions as abilities, tasks, questions, and actors. Tests describe what an actor does and observes.

## Advantages

- Strong readability for long workflows.
- Reusable tasks and questions across multi-step scenarios.
- Natural support for multiple identities and authorization roles.
- Clear separation between intent and implementation.

## Costs

- More concepts and files for simple endpoint checks.
- Higher onboarding cost.
- Generated OpenAPI probes do not naturally benefit from actor terminology.
- Small tests can become ceremonious.

## Why it was not selected for `main`

Screenplay is compelling for complex multi-actor authorization journeys. Most The Dog API coverage consists of single-service contract, filter, and lifecycle checks, so the additional ceremony is not justified as the default architecture.
