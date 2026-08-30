# Intent: Universal Agent UI

Author: R. Banda (engineering). Status: accepted.

## Problem

There is no single UI that can connect to AI agents built on different frameworks
(Google ADK, LangGraph, Hermes, OpenClaw). Each framework has its own UI or requires
Open WebUI, which intercepts agent tool calls and breaks the agent's own orchestration.
Engineers and users need a single chat interface that works with any agent via its URL.

## Proposed outcome

A production-grade, enterprise-ready chat UI built on CopilotKit (MIT) and the AG-UI
protocol that connects to any agent endpoint via URL. The UI shows full tool call
visibility, supports human-in-the-loop approval, streaming responses, and works with
any AG-UI-compatible agent backend regardless of framework.

## Affected users and systems

- Engineers deploying agents on OpenShift/Kubernetes
- End users chatting with agents
- Agent frameworks: Google ADK, LangGraph, Hermes, OpenClaw

## Constraints

- No paid CopilotKit Intelligence tier -- self-hosted only, MIT licensed components
- No agent registry service -- agents are configured via environment variables (URL map)
- Must support OIDC auth (Keycloak / OpenShift OAuth)
- Must persist conversation history (PostgreSQL)
- Must be brandable (logo, title, colors via env vars)
- Must be containerized (Docker + Helm for OpenShift)

## Open questions

- None blocking. All framework AG-UI adapters exist (some as PRs).
