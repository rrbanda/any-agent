# Any Agent — Universal Agent UI

## Commands
- Dev: `npm run dev` (starts Next.js on port 3000)
- Demo agent: `cd demo-agent && pip install -r requirements.txt && python server.py`
- Build: `npm run build`
- Lint: `npm run lint`
- Type check: `npx tsc --noEmit`
- Docker: `docker compose up --build`

## Architecture

Next.js App Router + **assistant-ui** (headless chat UI) with multiple runtime adapters.
Each agent framework gets the correct adapter at runtime:

```
Browser → assistant-ui React primitives
         → Runtime adapter (one of):
           • @assistant-ui/react-ag-ui      → AG-UI agent (ADK, CrewAI)
           • @assistant-ui/ai-sdk           → OpenAI-compatible (Hermes, vLLM)
           • @assistant-ui/react-langgraph  → Native LangGraph
           • @assistant-ui/react-google-adk → Google ADK native
         → Agent endpoint (configured via AGENTS env var)
```

Agents are configured via the `AGENTS` JSON env var — no registry, no database for agents.

## Key files
- `src/app/layout.tsx` — Root layout, dark theme, TooltipProvider
- `src/app/page.tsx` — Main page, renders ChatWrapper
- `src/components/chat-wrapper.tsx` — Protocol-based runtime auto-switch, ThreadList sidebar, speech adapters, custom tool UIs
- `src/components/assistant-ui/elements/thread.aui.tsx` — Full thread (upstream assistant-ui)
- `src/components/assistant-ui/elements/thread-list.aui.tsx` — Thread list sidebar
- `src/components/assistant-ui/elements/markdown-text.tsx` — Rich markdown rendering
- `src/components/assistant-ui/elements/reasoning.aui.tsx` — Collapsible reasoning display
- `src/components/assistant-ui/elements/tool-fallback.aui.tsx` — Tool call display
- `src/components/assistant-ui/elements/tool-group.aui.tsx` — Grouped tool calls
- `src/components/assistant-ui/elements/attachment.aui.tsx` — Attachment handling
- `src/components/assistant-ui/elements/follow-up-suggestions.aui.tsx` — Suggestion chips
- `src/components/assistant-ui/elements/tooltip-icon-button.tsx` — Shared icon button
- `src/components/ui/` — shadcn base primitives (button, skeleton, dialog, etc.)
- `src/hooks/` — Shared hooks (use-attachment-src, use-copy-to-clipboard)
- `src/components/agent-selector.tsx` — Dropdown to switch agents
- `src/lib/agents.ts` — Reads AGENTS env, returns typed config (supports ag-ui, langgraph, openai, google-adk)
- `src/lib/db.ts` — PostgreSQL persistence layer via `pg` (optional, enabled by DATABASE_URL)
- `src/lib/thread-persistence.ts` — RemoteThreadListAdapter wiring API routes to assistant-ui
- `src/lib/tool-uis.tsx` — Custom tool UI components (e.g., WeatherToolUI)
- `src/app/api/agents/route.ts` — Public agent list endpoint
- `src/app/api/threads/route.ts` — Thread CRUD (list, create)
- `src/app/api/threads/[id]/route.ts` — Thread get/update/delete
- `src/app/api/threads/[id]/messages/route.ts` — Message append
- `src/app/api/upload/route.ts` — File upload endpoint
- `src/app/api/feedback/route.ts` — Message feedback endpoint
- `src/app/api/health/route.ts` — Health check
- `prisma/schema.sql` — PostgreSQL schema for thread persistence
- `demo-agent/server.py` — AG-UI demo agent with reasoning, tool groups, tool results, markdown

## Conventions
- TypeScript strict mode. No `any` unless unavoidable (with eslint-disable comment).
- `@/*` import alias for `src/`.
- assistant-ui primitives in `src/components/assistant-ui/`.
- shadcn base components in `src/components/ui/`.
- Tailwind CSS only. Dark theme via `.dark` class on `<html>`.
- API routes in `src/app/api/`.
- Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`.
- Comments only for non-obvious *why*. Never narrate what the code does.
- Environment variables: descriptive names, documented in `.env.example`.

## Things to get right
- assistant-ui is headless — we own the styled components via shadcn primitives.
- Runtime adapter selection happens client-side based on agent protocol type.
- Each protocol gets its own React component (hooks can't be called conditionally).
- Never hardcode agent URLs — always read from AGENTS env var.
- AG-UI agents stream events (text, tool calls, state). OpenAI uses Vercel AI SDK. LangGraph uses SSE streaming. ADK uses createAdkStream.
- Speech adapters (WebSpeechSynthesisAdapter, WebSpeechDictationAdapter) are browser-native — no backend needed.
- Thread persistence is optional — enabled when DATABASE_URL is set, in-memory otherwise.
- The demo agent at `demo-agent/server.py` must always work for smoke testing.

## Do NOT
- Do NOT use CopilotKit. We migrated away from it due to shadow DOM theming issues.
- Do NOT add an agent registry service. Agents are simple URL configs.
- Do NOT add MCP server management UI. Out of scope.
- Do NOT add RAG / vector store features. Out of scope.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
