# Security Policy

## Secrets

API keys and tokens must only be supplied through environment variables or GitHub Actions secrets. They must never be committed, printed, attached to Allure, or included in request URLs.

## Test boundaries

Security tests in this repository are non-destructive and rate-limited. They use harmless payloads to verify validation, error handling, and information disclosure. Denial-of-service, brute-force, destructive injection, and attempts to access another user's private data are out of scope.

## Reporting

Report vulnerabilities privately to the API provider. Do not open a public issue containing an exploitable finding, credential, or private response body.
