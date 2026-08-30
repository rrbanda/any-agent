# Any Agent – Universal Agent UI

A production-grade chat UI that works with **any** AI agent framework (Google ADK, LangGraph, Hermes, OpenClaw, etc.) via the [AG-UI protocol](https://docs.ag-ui.com). Built on [CopilotKit](https://copilotkit.ai) (MIT licensed) and Next.js.

## Features

- **Framework-agnostic** – connect any AG-UI-compatible agent by URL
- **Tool call visibility** – see every tool invocation and result in the chat
- **Human-in-the-loop** – approve or reject agent actions before execution
- **Streaming** – real-time token streaming via AG-UI events
- **Multi-agent** – switch between agents from a dropdown selector
- **Branding** – customizable title, logo, and primary color via env vars
- **Enterprise-ready** – OIDC auth, conversation history (PostgreSQL), OpenShift Helm chart

## Quick Start

```bash
cp .env.example .env.local
# Edit .env.local with your agent URLs

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Configuration

All configuration is via environment variables (see `.env.example`):

| Variable | Description | Default |
|----------|-------------|---------|
| `AGENTS` | JSON map of agent name → `{url, name, description}` | `{}` |
| `APP_TITLE` | Application title shown in header | `Any Agent` |
| `APP_LOGO_URL` | URL to logo image | (none) |
| `APP_PRIMARY_COLOR` | Hex color for UI accent | `#6963ff` |

### Agent Configuration

```bash
AGENTS='{"assistant":{"url":"http://localhost:8080/ag-ui","name":"My Assistant","description":"General purpose agent"}}'
```

Each agent must expose an AG-UI-compatible endpoint. Most frameworks provide adapters:

- **Google ADK**: `from ag_ui.adk import AGUIAdapter`
- **LangGraph**: `from ag_ui.langgraph import AGUIAdapter`
- **CrewAI**: `from ag_ui.crewai import AGUIAdapter`

## Docker

```bash
docker compose up --build
```

This starts the app on port 3000 with a PostgreSQL instance for conversation history.

## OpenShift / Helm

```bash
helm install any-agent ./helm \
  --set agents.assistant=http://agent-svc:8080/v1 \
  --set branding.title="My Platform" \
  --set route.host=any-agent.apps.my-cluster.com
```

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  Browser                                            │
│  ┌───────────────────────────────────────────────┐  │
│  │ CopilotKit UI  (CopilotSidebar)               │  │
│  │ Agent Selector + Branding Header              │  │
│  └───────────────────┬───────────────────────────┘  │
└──────────────────────┼──────────────────────────────┘
                       │ AG-UI events (SSE)
┌──────────────────────┼──────────────────────────────┐
│  Next.js Server      │                              │
│  ┌───────────────────▼───────────────────────────┐  │
│  │ /api/copilotkit  (CopilotRuntime + HttpAgent) │  │
│  └───────────────────┬───────────────────────────┘  │
└──────────────────────┼──────────────────────────────┘
                       │ AG-UI protocol (HTTP)
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
   ┌─────────┐   ┌─────────┐   ┌─────────┐
   │ ADK     │   │ Hermes  │   │ LangGraph│
   │ Agent   │   │ Agent   │   │ Agent    │
   └─────────┘   └─────────┘   └─────────┘
```

## License

MIT
