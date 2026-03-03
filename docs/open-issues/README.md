# Open Issues — Agent Prompt Index

This folder contains one prompt document per open critical issue identified in the **Timeline Me** codebase. Each document is a self-contained, exhaustive task brief intended to be read and executed by a GitHub Copilot AI agent (or equivalent).

## Goal

Resolve every issue below to make the platform **robust, clean, convergent, and free of dead code**. Each agent must also update all relevant documentation consistently before closing its task.

## Priorities

| # | File | Topic | Priority |
|---|------|--------|----------|
| 01 | [01-fix-date-parsing-bug.md](./01-fix-date-parsing-bug.md) | **Bug fix**: off-by-one error in `Timesheet.parseDate()` causes wrong timeline placement | ✅ High |
| 02 | [02-remove-dead-linkedin-csv-adapter.md](./02-remove-dead-linkedin-csv-adapter.md) | **Dead code**: remove unused CSV LinkedIn adapter (`linkedin-adapter.ts`) | 🔴 High |
| 03 | [03-cleanup-bubble-legacy-code.md](./03-cleanup-bubble-legacy-code.md) | **Cleanup**: remove deprecated `getBubbles()`, legacy `marginLeft`/`width` fields, unnecessary `Bubble` instantiation | ✅ Medium |
| 04 | [04-fix-package-json.md](./04-fix-package-json.md) | **Cleanup**: fix placeholder package name, remove unused deps (`html2canvas`), fix lint script | ✅ Medium |
| 05 | [05-wire-dark-mode.md](./05-wire-dark-mode.md) | **Feature gap**: `next-themes` is installed but not integrated; dark mode toggle missing | ✅ Medium |
| 06 | [06-harden-url-encoding.md](./06-harden-url-encoding.md) | **Robustness**: replace deprecated `unescape`/`escape` in URL encoding, add length warning and schema validation | 🟠 Medium |
| 07 | [07-add-gdpr-consent-banner.md](./07-add-gdpr-consent-banner.md) | **Legal/Privacy**: add GDPR cookie consent banner with GA4 Consent Mode v2 | 🟡 Important |
| 08 | [08-write-architecture-docs.md](./08-write-architecture-docs.md) | **Documentation**: `docs/architecture/` is empty — write OVERVIEW, DATA_MODEL, PDF_PARSING, RENDERING_MODEL | 🟡 Important |
| 09 | [09-add-test-coverage.md](./09-add-test-coverage.md) | **Quality**: zero tests — add Vitest + unit tests for `Timesheet`, `url-utils`, `Bubble` | 🟡 Important |

## Rules for Each Agent

1. **Read `AI_AGENTS.md`** at project root before starting.
2. **Read the relevant source files** listed in your task prompt.
3. **Run `npm run build`** and confirm clean exit before committing.
4. **Run `npm run dev`** and visually verify the UI when your change affects rendering.
5. **Update all documentation** referenced in your task (do not leave docs stale).
6. **Use Conventional Commits** as specified in `AI_AGENTS.md`.
7. **Mark your task done** in this index by changing `[ ]` → `[x]` in the table (add a Done column or strike through the row).

## Status Tracking

When an agent completes a task, it should update the row in the table above with a ✅ in the Priority column and add a brief summary of what was done below:

| # | Status | Notes |
|---|--------|-------|
| 01 | ✅ Done | Fixed month parsing bug in Timesheet and added architecture doc |
| 02 | ⏳ Open | |
| 03 | ✅ Done | Removed legacy pixel layout code and refactored date label formatting into a pure function |
| 04 | ✅ Done | Fixed package name, cleaned deps, updated lint script, added DEVELOPMENT guide |
| 05 | ✅ Done | Integrated ThemeProvider, added ModeToggle, verified dark mode works |
| 06 | ⏳ Open | |
| 07 | ⏳ Open | |
| 08 | ⏳ Open | |
| 09 | ⏳ Open | |
