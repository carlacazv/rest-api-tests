# Contributing

## Language rule

All repository content must be written in English, including code, comments, commit messages, documentation, test names, workflow names, and pull request descriptions.

## Development workflow

1. Install tools with `mise install`.
2. Install dependencies with `mise run install`.
3. Create or update tests using the techniques documented in `docs/test-strategy.md`.
4. Run `mise run check` and the smallest relevant test task.
5. Run `mise run coverage-report` when the OpenAPI coverage policy changes.

## Test requirements

Every new endpoint or behavior must include:

- a risk classification;
- VADER coverage notes;
- relevant equivalence partitions;
- boundary cases for constrained parameters;
- a decision table when multiple conditions affect the outcome;
- cleanup for created data;
- Allure metadata with severity and feature labels.

Do not add fixed sleeps. Do not log secrets. Do not make mutation tests part of the default public suite.
