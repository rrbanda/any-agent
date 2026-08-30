# Any Agent — Intent

## Vision

Any Agent is a **distribution**, not a framework. It assembles upstream
open-source projects into a single deployable stack that lets any organization
use one UI for all their AI agents — regardless of framework.

The model: **assistant-ui** is the chat engine (like Kubernetes is the
orchestrator), and **Any Agent** is the opinionated, production-ready
distribution (like OpenShift).

## Problem

Every agent framework ships its own UI or expects you to build one. Teams
running Google ADK, LangGraph, Hermes, and CrewAI agents end up with four
different interfaces. There is no single, framework-agnostic frontend that
connects to any agent via standard protocols.

## Solution

A thin integration layer (~500 lines of custom code) on top of assistant-ui
that provides:

1. **Multi-protocol runtime switcher** — dynamically picks the correct
   assistant-ui adapter (AG-UI, LangGraph, OpenAI, ADK) based on the agent.
2. **Protocol auto-detection** — probes agent endpoints to identify which
   protocol they speak, eliminating manual config.
3. **Agent registry integration** — optionally fetches the agent catalog from
   agentregistry, so platform teams register agents once.
4. **Deployment manifests** — Helm chart and Docker Compose for production.

## What we do NOT build

- Chat UI — that's assistant-ui
- Agent catalog — that's agentregistry
- Agent-to-agent communication — that's A2A protocol
- Tool servers — that's MCP
- The agents themselves — that's ADK, LangGraph, CrewAI, etc.

## Upstream dependencies

| Project | Role | License |
|---------|------|---------|
| [assistant-ui](https://github.com/assistant-ui/assistant-ui) | Chat UI engine | MIT |
| [agentregistry](https://github.com/agentregistry-dev/agentregistry) | Agent catalog (optional) | Apache-2.0 |
| [AG-UI protocol](https://github.com/ag-ui-protocol/ag-ui) | Agent-user interaction | MIT |

## Future

- OIDC / OpenShift OAuth integration
- Multi-tenant persistent history (when auth is in place)
- Agent observability dashboard
- Contribution of runtime switcher upstream to assistant-ui
