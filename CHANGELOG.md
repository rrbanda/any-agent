# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- **Architecture pivot**: Any Agent is now a lean distribution model.
  assistant-ui is used as a dependency (not rebuilt). Custom code is limited
  to the integration layer: runtime switcher, protocol probe, registry
  client, agent selector, and deployment manifests.
- Removed PostgreSQL persistence layer (db.ts, thread-persistence.ts,
  thread API routes). Will re-add when auth layer is in place.
- Removed file upload and feedback endpoints (premature without auth).
- Removed speech/dictation/attachment adapter wiring from runtimes (these
  are assistant-ui built-ins; re-add when needed).
- Removed WeatherToolUI from app code (moved to demo-agent/examples/).
- Simplified docker-compose.yaml (removed Postgres service).
- Simplified Helm values.yaml (removed database config, added agentRegistry).

### Added
- **Protocol auto-detection** (`src/lib/probe.ts`): probes agent URLs to
  identify A2A, OpenAI-compatible, LangGraph, or AG-UI endpoints. Protocol
  field in agent config is now optional.
- **Agent registry client** (`src/lib/registry-client.ts`): fetches agents
  from an agentregistry instance when `AGENT_REGISTRY_URL` is set. Merges
  with AGENTS env var (env takes precedence).
- `AGENT_REGISTRY_URL` environment variable and Helm value.
- `demo-agent/examples/tool-ui-weather.tsx` as reference for custom tool UIs.

### Removed
- `src/lib/db.ts` — PostgreSQL CRUD
- `src/lib/thread-persistence.ts` — RemoteThreadListAdapter
- `src/lib/tool-uis.tsx` — moved to demo-agent/examples/
- `src/app/api/threads/` — all thread CRUD routes
- `src/app/api/feedback/route.ts`
- `src/app/api/upload/route.ts`
- `prisma/schema.sql`
- `pg`, `@types/pg`, `dotenv` dependencies

## [0.1.0] — 2026-08-30

### Added
- Initial project structure with Next.js and assistant-ui
- AG-UI protocol support via `@assistant-ui/react-ag-ui`
- Multi-agent selector with environment variable configuration
- Demo AG-UI echo agent (Python/FastAPI)
- Dark theme with shadcn/ui tokens
- Docker, Docker Compose, and Helm chart for deployment
- CI pipeline (lint, build, gitleaks)
- Branding via environment variables (title, logo)
- Multi-protocol runtime adapters (AG-UI, LangGraph, OpenAI, Google ADK)
- Protocol-based runtime auto-switch
