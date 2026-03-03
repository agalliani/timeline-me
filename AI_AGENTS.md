# AI Agent Instructions & Commit Convention

This document outlines the standards for AI agents working on `timeline-me`.

## 1. Project Context
- **Framework**: Next.js (App Router / Pages approach depending on `src/` content)
- **Role**: `timeline-me` is a web application.
- **Goal**: Maintain an intelligent, debuggable history and high-quality frontend implementation.

## 2. Commit Convention (Conventional Commits)
All commits must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification. 
Format: `<type>(<scope>): <subject>`

### Types
- **feat**: A new feature
- **fix**: A bug fix
- **refactor**: A code change that neither fixes a bug nor adds a feature (e.g., cleanup, performance)
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- **test**: Adding missing tests or correcting existing tests
- **docs**: Documentation only changes
- **chore**: Changes to the build process or auxiliary tools

### Rules
- Scope is optional but recommended (e.g., `timeline`, `auth`, `ui`).
- Subject uses the imperative, present tense: "change" not "changed" or "changes". No dot (.) at the end.
- *Examples*: 
  - `feat(timeline): add zoom controls to the timeline view`
  - `fix(parsing): resolve date parsing error for leap years`

## 3. AI Workflow
1. **Read this file** and the `docs/` hierarchy before starting work to understand the protocols.
   - For architecture, see `docs/architecture/`.
   - For standard procedures, see `.agent/workflows/`.
2. **Run `npm test`** before committing to ensure no regressions.
   - All tests must pass: `npm test` must exit with code 0.
   - Tests are in `src/lib/__tests__/` and use Vitest.
3. **Visual Verification Loop (MANDATORY)**:
   - Every frontend feature or refactor MUST be verified by running the application locally (`npm run dev`).
   - Capture visual proof (or use the browser subagent) to confirm the visual output matches expectations on `http://localhost:3000`.
   - Use this visual proof to close the feedback loop before committing.
4. **Use atomic commits**: Commit often, but ensure each commit represents a logical unit of work.
