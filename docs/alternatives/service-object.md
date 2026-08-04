# Alternative Architecture: Service Object

## Intent

This branch centralizes endpoint access in one `DogApiService`. Tests call methods on the service rather than composing domain clients.

## Advantages

- Low onboarding cost.
- Fewer files and abstractions.
- Familiar pattern for small and stable APIs.
- Fast to add a new endpoint during early project stages.

## Costs

- The service grows into a broad dependency as endpoint count increases.
- Domain boundaries become weaker.
- Authentication, uploads, account state, and read-only operations compete for the same abstraction.
- Parallel ownership and targeted refactoring become harder.

## Why it was not selected for `main`

The Dog API has enough domains and execution policies that a single service object would trend toward a god object. The modular ports-and-adapters architecture in `main` retains the same readability while containing change by domain.
