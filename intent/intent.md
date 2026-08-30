# Intent: Any Agent — Universal Agent UI

Author: R. Banda. Status: accepted.

## Problem

Every AI agent framework ships its own UI — Google ADK Web, LangGraph Studio,
Hermes CLI, CrewAI playground. Teams deploying multiple frameworks are forced to
maintain multiple UIs, each with different auth, branding, and conversation history.
Open WebUI intercepts agent tool calls with its own orchestration loop, breaking
external agent frameworks. There is no single, framework-agnostic UI.

## Proposed outcome

A production-grade, open-source chat UI that connects to **any** agent via its URL.
Built on **assistant-ui** (MIT, headless React chat primitives) with runtime adapters
for AG-UI, LangGraph, and OpenAI-compatible protocols. The UI provides:

- Full tool call visibility (enterprise-grade transparency)
- Streaming responses
- Human-in-the-loop approval (where agents support it)
- Multi-agent switching from a single interface
- Consistent branding, auth, and persistence across all agents

## Affected users and systems

- Platform engineers deploying agents on OpenShift/Kubernetes
- End users chatting with agents from any framework
- Agent frameworks: Google ADK, LangGraph, Hermes/vLLM, CrewAI, AutoGen

## Constraints

- Open source (MIT). No paid tiers required for core functionality.
- No agent registry service — agents configured via environment variables (JSON URL map).
- Must support OIDC auth (Keycloak / OpenShift OAuth) — Phase 1.
- Must persist conversation history (PostgreSQL) — Phase 1.
- Must be brandable (logo, title, colors via env vars).
- Must be containerized (Docker + Helm for OpenShift).

## Key tech decisions

- **assistant-ui over CopilotKit**: assistant-ui is headless with shadcn/ui primitives,
  giving full theming control. CopilotKit's shadow DOM caused intractable dark theme
  issues and its component model was too opinionated for a standalone product.
- **Multi-runtime over single protocol**: Rather than forcing all agents through AG-UI,
  we use the best adapter per framework — AG-UI for ADK, native LangGraph adapter,
  Vercel AI SDK for OpenAI-compatible endpoints.
- **No agent registry**: Simple URL configuration keeps complexity low and avoids
  unnecessary infrastructure dependencies.

## Open questions

- Hermes AG-UI adapter maturity — fallback to OpenAI-compatible endpoint via AI SDK.
