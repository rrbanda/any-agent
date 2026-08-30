# Any Agent — Lean Distribution

## Commands
- Dev: `npm run dev` (starts Next.js on port 3000)
- Demo agent: `cd demo-agent && pip install -r requirements.txt && python server.py`
- Build: `npm run build`
- Lint: `npm run lint`
- Type check: `npx tsc --noEmit`
- Docker: `docker compose up --build`

## Architecture

Any Agent is a **distribution** on top of assistant-ui — like OpenShift on
Kubernetes. The chat UI is stock assistant-ui; we add the multi-agent glue.

```
Browser → assistant-ui React primitives (upstream, not our code)
       → Runtime switcher (our code — chat-wrapper.tsx)
         → picks adapter per protocol:
           • @assistant-ui/react-ag-ui      → AG-UI agents
           • @assistant-ui/ai-sdk           → OpenAI-compatible (Hermes, vLLM)
           • @assistant-ui/react-langgraph  → LangGraph agents
           • @assistant-ui/react-google-adk → Google ADK agents
       → Agent endpoint (configured via AGENTS env or agentregistry)
```

## Key files (custom code only)
- `src/components/chat-wrapper.tsx` — Runtime switcher + agent selector portal
- `src/components/agent-selector.tsx` — Agent dropdown UI
- `src/lib/agents.ts` — Agent config from env + registry + auto-detection
- `src/lib/probe.ts` — Protocol auto-detection via HTTP fingerprinting
- `src/lib/registry-client.ts` — Optional agentregistry REST client
- `src/lib/branding.ts` — Title/logo from env vars
- `src/app/api/agents/route.ts` — Public agent list endpoint
- `src/app/api/health/route.ts` — K8s health check

## Stock assistant-ui files (do not modify unless necessary)
- `src/components/assistant-ui/elements/*` — Upstream UI primitives
- `src/components/ui/*` — shadcn base components
- `src/hooks/*` — Shared hooks

## Conventions
- TypeScript strict mode. No `any` unless unavoidable (with eslint-disable).
- `@/*` import alias for `src/`.
- Tailwind CSS only. Dark theme via `.dark` class on `<html>`.
- Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`.
- Comments only for non-obvious *why*. Never narrate what the code does.
- Environment variables documented in `.env.example`.

## Do NOT
- Do NOT rebuild assistant-ui features. Use them as dependencies.
- Do NOT add database/persistence until auth is implemented.
- Do NOT fork assistant-ui. Import it as a package.
- Do NOT add MCP server management or RAG features. Out of scope.
- The demo agent at `demo-agent/server.py` must always work for smoke testing.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
