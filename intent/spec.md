# Spec: Universal Agent UI

Derived from: intent/intent.md. Status: accepted.

## Architecture

Next.js app with CopilotKit Runtime v2 (Express-mode, single-route).
Agents are `HttpAgent` instances created from a JSON env var at startup.

```
Browser -> Next.js (CopilotKit React UI) -> /api/copilotkit (CopilotRuntime v2) -> HttpAgent(url) -> Agent AG-UI endpoint
```

## Agent Configuration

Environment variable `AGENTS` contains a JSON object mapping agent names to their config:

```json
{
  "rfp-agent": {
    "url": "http://hermes:8000",
    "name": "RFP Response Agent",
    "description": "Generates RFP responses"
  },
  "data-analyst": {
    "url": "http://adk-agent:8000",
    "name": "Data Analyst",
    "description": "Analyzes datasets with ADK"
  }
}
```

No registry. No database for agents. Just URLs.

## Frontend

- CopilotKit React UI (`@copilotkit/react-core`, `@copilotkit/react-ui`)
- Agent selector dropdown reading from `/api/agents` (returns parsed AGENTS env)
- Branding via CSS custom properties from env vars:
  - `APP_TITLE` (default: "Any Agent")
  - `APP_LOGO_URL` (optional)
  - `APP_PRIMARY_COLOR` (default: "#6963ff")

## Backend (CopilotKit Runtime)

- Next.js API route at `/api/copilotkit/[...slug]`
- CopilotRuntime v2 with `createCopilotRuntimeHandler`
- One `HttpAgent` per entry in AGENTS env var
- Default agent configurable via `DEFAULT_AGENT` env var

## Auth (Phase 2)

- OIDC middleware on `/api/copilotkit` route
- Keycloak / OpenShift OAuth provider
- JWT validation, user info extraction
- Protected routes redirect to login

## Persistence (Phase 2)

- PostgreSQL via Prisma ORM
- Tables: conversations, messages, users
- API routes: `/api/conversations` (CRUD)

## Deployment

- Single Dockerfile (Next.js standalone output)
- docker-compose.yaml with PostgreSQL
- Helm chart for OpenShift

## Out of scope

- Agent registry service
- Admin panel
- File upload / attachments
- RAG / vector stores
- MCP server management UI
