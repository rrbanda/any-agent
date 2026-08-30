# Spec: Any Agent — Universal Agent UI

Derived from: intent/intent.md. Status: accepted.

## Architecture

```
Browser
  └─ Next.js App Router
       └─ assistant-ui React primitives (shadcn/ui-based)
            └─ Runtime adapter (selected per agent):
                 ├─ @assistant-ui/react-ag-ui    → AG-UI protocol (ADK, CrewAI)
                 ├─ @assistant-ui/react-langgraph → Native LangGraph
                 └─ @assistant-ui/ai-sdk          → OpenAI-compatible (Hermes, vLLM)
            └─ Agent endpoint (URL from AGENTS env var)
```

All agent communication happens client-side via assistant-ui runtime adapters.
No server-side proxy is needed for the chat protocol itself. The Next.js API layer
only serves agent configuration (`/api/agents`) and health checks (`/api/health`).

## Agent Configuration

Environment variable `AGENTS` contains a JSON object:

```json
{
  "rfp-agent": {
    "url": "http://hermes:8000",
    "name": "RFP Response Agent",
    "description": "Generates RFP responses",
    "protocol": "openai"
  },
  "data-analyst": {
    "url": "http://adk-agent:8000",
    "name": "Data Analyst",
    "description": "Analyzes datasets with ADK",
    "protocol": "ag-ui"
  },
  "graph-agent": {
    "url": "http://langgraph:8123",
    "name": "Research Assistant",
    "description": "Multi-step research via LangGraph",
    "protocol": "langgraph"
  }
}
```

Supported protocol values: `ag-ui`, `langgraph`, `openai`.

## Frontend

- **assistant-ui** headless primitives for chat UI (`@assistant-ui/react`)
- Styled with shadcn/ui components — fully owned, fully themeable
- Thread management via assistant-ui's `ThreadList` primitive
- Agent selector dropdown reading from `/api/agents`
- Runtime switching: `src/lib/runtime-switch.ts` returns the correct
  `useAssistantRuntime()` hook based on the selected agent's `protocol` field
- Branding via CSS custom properties from env vars:
  - `APP_TITLE` (default: "Any Agent")
  - `APP_LOGO_URL` (optional)
  - `APP_PRIMARY_COLOR` (default: "#6963ff")

## Runtime Adapters

| Protocol     | Package                          | Agent Examples              |
|-------------|----------------------------------|-----------------------------|
| `ag-ui`     | `@assistant-ui/react-ag-ui`      | Google ADK, CrewAI, custom  |
| `langgraph` | `@assistant-ui/react-langgraph`  | LangGraph Cloud/Studio      |
| `openai`    | `@assistant-ui/ai-sdk`           | Hermes, vLLM, any OpenAI-compatible |

## Auth (Phase 1)

- OIDC middleware on API routes
- Keycloak / OpenShift OAuth provider
- JWT validation, user info extraction
- Protected routes redirect to login

## Persistence (Phase 1)

- PostgreSQL for conversation history
- assistant-ui's `RemoteThreadListAdapter` + `ThreadHistoryAdapter` for integration
- API routes: `/api/threads` (CRUD)

## Deployment

- Single Dockerfile (Next.js standalone output)
- docker-compose.yaml with PostgreSQL
- Helm chart for OpenShift/Kubernetes

## Out of scope

- Agent registry service
- Admin panel
- File upload / attachments
- RAG / vector stores
- MCP server management UI
- CopilotKit (migrated away)
