# Twelve-Factor Compliance

Although this repository is a test system rather than a long-running application, each factor is applied to its execution model.

| Factor | Implementation |
| --- | --- |
| I. Codebase | One Git repository tracks one test system; branches and PRs represent versions, not separate copies. |
| II. Dependencies | Runtime and tooling dependencies are explicitly declared in `package.json`; Node and Java are declared in `mise.toml`. |
| III. Config | URLs, keys, limits, worker counts, and execution gates come from environment variables. |
| IV. Backing services | The Dog API and GitHub Pages are attached resources selected by configuration. |
| V. Build, release, run | Dependency installation and type checking are separate from test execution and report deployment. |
| VI. Processes | Test workers are stateless; generated files are disposable artifacts. |
| VII. Port binding | The test process exposes no service. The generated Allure site is static and is served by the execution environment or the one-off Allure command. |
| VIII. Concurrency | Playwright workers scale read-only tests; mutation tests use one worker to protect shared state. |
| IX. Disposability | Processes start quickly, use timeouts, and clean created resources in `finally` blocks. |
| X. Dev/prod parity | mise pins the same runtimes used by CI; all environments use the same commands and configuration contract. |
| XI. Logs | Test output is written to stdout/stderr; CI captures and routes it. The suite does not manage persistent log files. |
| XII. Admin processes | OpenAPI snapshots, coverage reports, cleanup, and Allure generation are one-off mise tasks committed with the code. |
