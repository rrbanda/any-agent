# Any Agent

**One UI for every AI agent.** Connect to Google ADK, LangGraph, Hermes, CrewAI, or any AG-UI / OpenAI-compatible agent — from a single interface.

---

## The Problem

Every agent framework ships its own UI. Google ADK has ADK Web. LangGraph has Studio. Hermes has a CLI. Teams deploying multiple frameworks maintain multiple frontends with duplicated auth, branding, and conversation history.

**Any Agent** solves this by providing a single, production-grade chat UI that connects to any agent via its URL.

## Features

- **Framework-agnostic** — Works with any agent that speaks AG-UI, LangGraph, or OpenAI-compatible protocols
- **Full tool-call visibility** — See every tool the agent calls, with arguments and results
- **Streaming responses** — Real-time token streaming from any backend
- **Multi-agent switching** — Select between agents from a dropdown without reloading
- **Dark theme by default** — Clean, modern UI built on shadcn/ui primitives
- **Brandable** — Customize title, logo, and colors via environment variables
- **Enterprise-ready** — OIDC auth, PostgreSQL persistence, Helm chart for Kubernetes/OpenShift
- **Open source** — MIT licensed, no paid tiers required

## Architecture

```
Browser
  └─ Next.js App Router
       └─ assistant-ui React primitives (headless, shadcn/ui-based)
            └─ Runtime adapter (selected per agent):
                 ├─ @assistant-ui/react-ag-ui    → AG-UI protocol (ADK, CrewAI)
                 ├─ @assistant-ui/react-langgraph → Native LangGraph
                 └─ @assistant-ui/ai-sdk          → OpenAI-compatible (Hermes, vLLM)
            └─ Agent endpoint (URL from AGENTS env var)
```

## Quick Start

### Prerequisites

- Node.js 22+
- Python 3.11+ (for the demo agent)

### 1. Clone and install

```bash
git clone https://github.com/rrbanda/any-agent.git
cd any-agent
npm install
```

### 2. Start the demo agent

```bash
cd demo-agent
pip install -r requirements.txt
python server.py
```

### 3. Start the UI

```bash
cd ..
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You should see the chat UI connected to the demo agent.

### 4. Connect your own agents

Edit `.env.local` to configure your agents:

```bash
AGENTS='{"my-agent":{"url":"http://localhost:8000","name":"My Agent","description":"My custom agent","protocol":"ag-ui"}}'
```

Supported `protocol` values:
| Protocol | Use for | Package |
|-----------|---------|---------|
| `ag-ui` | Google ADK, CrewAI, custom AG-UI servers | `@assistant-ui/react-ag-ui` |
| `langgraph` | LangGraph Cloud/Studio agents | `@assistant-ui/react-langgraph` |
| `openai` | Hermes, vLLM, any OpenAI-compatible endpoint | `@assistant-ui/ai-sdk` |

## Deployment

### Docker

```bash
docker compose up --build
```

### Kubernetes / OpenShift

```bash
helm install any-agent ./helm \
  --set env.AGENTS='{"my-agent":{"url":"http://agent-svc:8000","name":"My Agent","protocol":"ag-ui"}}'
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `AGENTS` | No | Demo agents | JSON map of agent configs |
| `DEFAULT_AGENT` | No | First agent | Default agent ID |
| `APP_TITLE` | No | `Any Agent` | UI title |
| `APP_LOGO_URL` | No | — | Logo URL |
| `APP_PRIMARY_COLOR` | No | `#6963ff` | Primary brand color |

## Tech Stack

- **Frontend**: [Next.js](https://nextjs.org) + [assistant-ui](https://assistant-ui.com) + [Tailwind CSS](https://tailwindcss.com)
- **Protocols**: [AG-UI](https://github.com/ag-ui-protocol/ag-ui) + OpenAI-compatible + LangGraph
- **Deployment**: Docker, Helm, OpenShift-ready

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines. This project follows conventional commits and uses an agentic SDLC workflow.

## License

[MIT](LICENSE)
