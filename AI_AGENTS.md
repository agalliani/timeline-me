# AI Agent Instructions & Commit Convention

This document outlines the standards for AI agents working on this repository to ensure a clean, intelligent, and debuggable history.

## Commit Convention (Conventional Commits)

All commits must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification. This allows for automatic changelog generation and easier debugging.

### Format
`<type>(<scope>): <subject>`

### Types
- **feat**: A new feature
- **fix**: A bug fix
- **refactor**: A code change that neither fixes a bug nor adds a feature (e.g., cleanup, performance)
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- **test**: Adding missing tests or correcting existing tests
- **docs**: Documentation only changes
- **chore**: Changes to the build process or auxiliary tools and libraries such as documentation generation

### Scope
Optional but recommended. Indicates the module or component affected (e.g., `timeline`, `auth`, `deps`).

### Subject
- Use the imperative, present tense: "change" not "changed" or "changes"
- Don't capitalize the first letter
- No dot (.) at the end

### Examples
- `feat(timeline): add zoom controls to the timeline view`
- `fix(parsing): resolve date parsing error for leap years`
- `refactor(core): remove direct DOM manipulation in favor of angular templates`
- `style(css): fix indentation in styles.css`

## AI Workflow
1.  **Read this file** before starting work to understand the protocols.
2.  **Check existing issues/tasks** to avoid duplication.
3.  **Visual Verification Loop (MANDATORY)**:
    -   Every frontend feature or refactor MUST be verified by running the application locally.
    -   **Capture a screenshot** or video of the local build (`http://localhost:4200`) to confirm the visual output matches expectations.
    -   Use this visual proof to close the feedback loop before committing.
    -   *Future:* Once the webapp is stable, verification will also extend to the production environment.
4.  **Use atomic commits**: Commit often, but ensure each commit represents a logical unit of work.
