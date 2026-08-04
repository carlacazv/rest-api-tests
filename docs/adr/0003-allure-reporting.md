# ADR 0003: Use Allure Report and GitHub Pages

- Status: Accepted
- Date: 2026-08-03

## Context

API test results need endpoint context, severity, parameters, steps, attachments, and a browsable historical execution artifact.

## Decision

Use `allure-playwright` for result generation, upload raw results as workflow artifacts, and publish the static report from successful `main` runs to GitHub Pages.

## Consequences

- Reports are rich and portable.
- Java is required to generate Allure 2 reports.
- Secrets must never be attached, even with visual masking.
