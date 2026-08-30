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
for AG-UI, LangGraph, and OpenAI-compatible protocols.

### Core Chat Features (assistant-ui primitives)

- **Markdown rendering** — Rich text, code blocks with syntax highlighting, tables,
  links, and lists via `makeMarkdownText` from `@assistant-ui/react-markdown`
- **Streaming responses** — Real-time token-by-token text streaming from any backend
- **Full tool call visibility** — See every tool the agent calls with arguments and
  results; fallback UI for unregistered tools, named tool UIs for known tools
- **Message editing** — Edit any previous user message and regenerate from that point
  via `ComposerPrimitive` edit mode
- **Branch picker** — Navigate between alternative response branches after edits
  via `BranchPickerPrimitive`
- **Copy and reload** — Copy assistant messages to clipboard, regenerate responses
  via `ActionBarPrimitive`
- **Welcome suggestions** — Clickable suggestion chips on the welcome screen via
  `SuggestionPrimitive` and `ThreadPrimitive.Suggestions`
- **Scroll-to-bottom** — Auto-scroll with manual override via `ThreadPrimitive.ScrollToBottom`

### Reasoning and Thinking

- **Reasoning display** — Collapsible accordion showing agent chain-of-thought from
  AG-UI `THINKING_*` and `REASONING_*` events, controlled via `showThinking` runtime option
- **Reasoning groups** — Consecutive reasoning parts grouped together visually

### Thread Management

- **Thread list sidebar** — Conversation history with create, switch, rename, archive,
  and delete via `ThreadListPrimitive` and `ThreadListItemPrimitive`
- **In-memory thread list** — Client-side multi-conversation for development/demos
- **Remote thread list** — Server-side persistence via `RemoteThreadListAdapter` backed
  by PostgreSQL (Phase 1)
- **Thread history** — Per-thread message persistence and reload via `ThreadHistoryAdapter`

### Adapter-Driven Features

These capabilities are enabled by plugging adapters into the runtime. The UI surfaces
(buttons, inputs) appear automatically when the adapter is provided:

- **Attachments** — File and image upload via `AttachmentAdapter`; composer renders a
  paperclip button when enabled. Supports `CompositeAttachmentAdapter` for multiple
  file types (images, PDFs, text).
- **Feedback** — Thumbs up/down on assistant messages via `FeedbackAdapter`; persisted
  to `/api/feedback` endpoint
- **Speech synthesis** — Text-to-speech for assistant messages via `SpeechSynthesisAdapter`;
  message bubbles render an audio button when enabled
- **Dictation** — Speech-to-text input for the composer via `DictationAdapter`; renders
  a microphone button when enabled
- **Follow-up suggestions** — Auto-generated follow-up prompts after each assistant
  message via `SuggestionAdapter`

### Multi-Agent and Multi-Protocol

- **Multi-agent switching** — Select between agents from a dropdown without reloading
- **AG-UI protocol** — `@assistant-ui/react-ag-ui` for Google ADK, CrewAI, custom agents
- **LangGraph protocol** — `@assistant-ui/react-langgraph` for native LangGraph agents
- **OpenAI-compatible** — `@assistant-ui/ai-sdk` for Hermes, vLLM, any `/v1/chat/completions`
- **A2A protocol** — `@assistant-ui/react-a2a` for Google Agent-to-Agent protocol (future)
- **Runtime auto-switch** — Agent selector picks the correct runtime adapter based on
  the agent's `protocol` field

### Human-in-the-Loop

- **Tool approval** — Approve or reject tool calls before execution via AG-UI interrupt
  events and `useAgUiSubmitInterruptResponses`
- **Human tools** — Agent can request human input mid-execution via `hitlTool` /
  `humanTool` registration

### Enterprise Features

- **OIDC authentication** — Keycloak / OpenShift OAuth middleware (Phase 1)
- **Conversation persistence** — PostgreSQL via `RemoteThreadListAdapter` +
  `ThreadHistoryAdapter` (Phase 1)
- **Brandable** — Customize title and logo via environment variables
- **Dark theme** — Full dark mode via shadcn/ui CSS tokens
- **Containerized** — Docker, Docker Compose, Helm chart for OpenShift/Kubernetes
- **Security headers** — X-Frame-Options, CSP, HSTS via Next.js middleware

## Affected users and systems

- Platform engineers deploying agents on OpenShift/Kubernetes
- End users chatting with agents from any framework
- Agent frameworks: Google ADK, LangGraph, Hermes/vLLM, CrewAI, AutoGen

## Constraints

- Open source (MIT). No paid tiers required for core functionality.
- No agent registry service — agents configured via environment variables (JSON URL map).
- Must support OIDC auth (Keycloak / OpenShift OAuth) — Phase 1.
- Must persist conversation history (PostgreSQL) — Phase 1.
- Must be brandable (logo, title via env vars).
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
- **Adapter-driven feature enablement**: UI features (attachments, feedback, speech)
  appear automatically when their adapter is provided, keeping the core lean while
  allowing enterprise deployments to opt in to advanced capabilities.

## Out of scope

- Agent registry service
- Admin panel
- RAG / vector stores
- MCP server management UI
- Generative UI (agent-driven custom component rendering) — revisit when agent-side
  spec support is broadly available

## Open questions

- Hermes AG-UI adapter maturity — fallback to OpenAI-compatible endpoint via AI SDK.
- A2A protocol adapter availability timeline for assistant-ui.
