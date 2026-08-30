# Any Agent

**One UI for every AI agent.** A lean distribution that assembles
[assistant-ui](https://github.com/assistant-ui/assistant-ui) (chat),
[agentregistry](https://github.com/agentregistry-dev/agentregistry) (catalog),
and multi-protocol runtime adapters into a single deployable stack.

Any Agent is to assistant-ui what OpenShift is to Kubernetes — the upstream
library does the heavy lifting; this project adds the integration layer that
makes it work across agent frameworks in production.

## What it does

- **Connect to any agent** — Google ADK, LangGraph, Hermes/vLLM, CrewAI, or
  any OpenAI-compatible endpoint. Same UI, same experience.
- **Auto-detect protocols** — Point it at an agent URL; Any Agent probes
  `/.well-known/agent.json` (A2A), `/v1/models` (OpenAI), `/threads`
  (LangGraph) and picks the right adapter automatically.
- **Agent registry integration** — Optionally connect to
  [agentregistry](https://github.com/agentregistry-dev/agentregistry) so
  platform teams register agents once and every user sees them in the dropdown.
- **Deploy anywhere** — Docker Compose for local dev, Helm chart for
  OpenShift/Kubernetes.

## Architecture

```
┌──────────────────────────────────────────────────────┐
│  Any Agent (the distribution)                        │
│                                                      │
│  ┌─────────────┐  ┌───────────────┐  ┌───────────┐  │
│  │ Agent       │  │ Runtime       │  │ Protocol  │  │
│  │ Selector UI │→ │ Switcher      │→ │ Probe     │  │
│  └─────────────┘  └───────────────┘  └───────────┘  │
│         │                │                           │
│         │         ┌──────┴──────┐                    │
│         │         │ Registry    │                    │
│         └────────→│ Client      │                    │
│                   └─────────────┘                    │
├──────────────────────────────────────────────────────┤
│  Upstream dependencies (not our code)                │
│                                                      │
│  assistant-ui ─── Chat UI, threads, markdown, tools  │
│  agentregistry ── Agent catalog API (optional)       │
└──────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────┐
│  Agent backends (any protocol)                       │
│  AG-UI │ LangGraph │ OpenAI-compat │ Google ADK/A2A  │
└──────────────────────────────────────────────────────┘
```

## Quick start

```bash
# 1. Clone
git clone https://github.com/rrbanda/any-agent.git
cd any-agent

# 2. Install
npm install

# 3. Start the demo agent (optional — for testing)
cd demo-agent && pip install -r requirements.txt && python server.py &
cd ..

# 4. Run
npm run dev
# Open http://localhost:3000
```

## Configuration

Agents are configured via the `AGENTS` environment variable (JSON map) or
fetched from an agentregistry instance via `AGENT_REGISTRY_URL`. The
`protocol` field is optional — if omitted, the probe auto-detects it.

```bash
# Single agent (protocol auto-detected)
AGENTS='{"hermes":{"url":"http://localhost:8000","name":"Hermes"}}'

# Multiple agents with explicit protocols
AGENTS='{"demo":{"url":"http://localhost:8000","name":"Demo","protocol":"ag-ui"},"hermes":{"url":"http://vllm:8080/v1/chat/completions","name":"Hermes","protocol":"openai"}}'

# Or use an agentregistry instance
AGENT_REGISTRY_URL=http://agentregistry:12121
```

See [`.env.example`](.env.example) for all options.

## Deploy

```bash
# Docker Compose
docker compose up --build

# Helm (OpenShift / Kubernetes)
helm install any-agent ./helm \
  --set branding.title="My Agent Hub" \
  --set agentRegistry.url="http://agentregistry:12121"
```

## Custom code (what we maintain)

| File | Purpose | Lines |
|------|---------|-------|
| `src/components/chat-wrapper.tsx` | Runtime switcher — picks the correct assistant-ui adapter per agent protocol | ~270 |
| `src/components/agent-selector.tsx` | Agent dropdown UI, portaled into the composer | ~40 |
| `src/lib/agents.ts` | Agent config from env + registry, with auto-detection | ~100 |
| `src/lib/probe.ts` | Protocol auto-detection via HTTP fingerprinting | ~50 |
| `src/lib/registry-client.ts` | Optional agentregistry REST client | ~80 |
| `src/lib/branding.ts` | Title/logo from env vars | ~10 |
| `src/app/api/agents/route.ts` | Public agent list endpoint | ~10 |
| `src/app/api/health/route.ts` | K8s liveness/readiness probe | ~5 |

Everything else (chat UI, markdown, tool display, threads, reasoning) is
stock [assistant-ui](https://github.com/assistant-ui/assistant-ui) used as a
dependency.

## Supported protocols

| Protocol | Adapter | Frameworks |
|----------|---------|------------|
| AG-UI | `@assistant-ui/react-ag-ui` | CrewAI, AG-UI agents |
| OpenAI-compatible | `@assistant-ui/ai-sdk` | Hermes, vLLM, OpenClaw, any `/v1/chat/completions` |
| LangGraph | `@assistant-ui/react-langgraph` | LangGraph agents |
| Google ADK / A2A | `@assistant-ui/react-google-adk` | Google ADK, A2A agents |

## Credits

- [assistant-ui](https://github.com/assistant-ui/assistant-ui) — the chat UI engine (MIT)
- [agentregistry](https://github.com/agentregistry-dev/agentregistry) — agent catalog (Apache-2.0)
- [AG-UI protocol](https://github.com/ag-ui-protocol/ag-ui) — agent-user interaction standard

## License

[MIT](LICENSE)
