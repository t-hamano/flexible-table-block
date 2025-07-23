# GitHub Copilot Username Test Results

This file documents the test results for checking what username is used when GitHub Copilot Coding Agent makes commits.

## Test Purpose

To verify the username that will be recorded in commits made by GitHub Copilot Coding Agent, which will help the WordPress Props bot action know to skip Copilot commits.

## Test Results

When GitHub Copilot Coding Agent makes commits, the following author information is recorded:

- **Author**: `copilot-swe-agent[bot] <198982749+Copilot@users.noreply.github.com>`
- **Committer**: `copilot-swe-agent[bot] <198982749+Copilot@users.noreply.github.com>`
- **Username Pattern**: `copilot-swe-agent[bot]`
- **Email Pattern**: `198982749+Copilot@users.noreply.github.com`

## Props Bot Configuration

The WordPress Props bot action should be configured to skip commits from the username `copilot-swe-agent[bot]` or any username matching the pattern `*copilot*[bot]` to exclude GitHub Copilot commits from automatic Props attribution.

## Test Commit

The test commit that demonstrates this behavior is: `5c223a1fda2d2eee9d41c765bb83275d70259377`

Command used to verify:
```bash
git log -1 --pretty=fuller
```