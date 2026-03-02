# Temporary Analysis: timeline-me Structure & AI Directives

*This file acts as a temporary memory for analyzing the `timeline-me` structure based on lessons from the `frontend-oxymeter` project.*

## 1. Current State Summary
- **Target Project:** `timeline-me` (Next.js project in `src/`).
- **Issues:** The project lacks a structured `docs/` folder. It has a single `AI_AGENTS.md` file, but according to the user's feedback, we want to create optimized copies of the global rules for different AI agents (e.g., Cursor, Windsurf) and organize documentation cleanly.
- **Root Files:** Features various root scripts (`analyze_pdf.mjs`, etc.) and a `legacy-angular` folder.

## 2. Proposed Improvements (Inspired by frontend-oxymeter)

### A. Creating the `docs/` Hierarchy
We should introduce a structured `docs/` folder to prevent the root or a single folder from getting messy later on:
1. **`docs/architecture/`**: For structural documents (e.g., data models, architecture overviews).
2. **`docs/guides/`**: For development, deployment, and contributing guidelines.
3. **`docs/strategy/`**: For SEO, growth, and analytics plans.
4. **`docs/research/`**: For ephemeral audits or experiment results.
5. **`docs/ai/`**: For custom prompt templates.

### B. Global AI Agent Directives
The user explicitly wants "un nome che sia adatto per tutti gli agenti. in alternativa fare una copia ottimizzata per ciascun tipo di agente, per ottimizzare la loro comprensione".
We will take the alternative approach: **Create optimized copies for each agent.**
1. `.cursorrules`: Optimized for Cursor IDE.
2. `.windsurfrules`: Optimized for Windsurf.
3. `AI_AGENTS.md`: General instructions for GitHub Copilot, ChatGPT, or CLI agents.

### C. Agent Workflows
Create `.agent/workflows/` (or similar) as seen in `frontend-oxymeter` to store step-by-step procedures that agents can execute automatically.

---
## 3. Execution Steps
*(To be detailed in implementation_plan.md)*
