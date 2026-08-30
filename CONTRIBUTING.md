# Contributing to Any Agent

Thank you for considering a contribution to Any Agent. This guide covers everything you need to get started.

## Quick start

```bash
git clone https://github.com/rrbanda/any-agent.git
cd any-agent
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). To test with the demo agent:

```bash
cd demo-agent
pip install -r requirements.txt
python server.py
```

## Development commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Next.js dev server on port 3000 |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npx tsc --noEmit` | Type-check without emitting |

## How to contribute

### Reporting bugs

Open a [bug report](https://github.com/rrbanda/any-agent/issues/new?template=bug_report.yml). Include:

- Any Agent version and Node.js version
- Steps to reproduce
- Expected vs actual behavior
- Which agent framework you were connecting to (ADK, LangGraph, Hermes, etc.)

### Suggesting features

Open a [feature request](https://github.com/rrbanda/any-agent/issues/new?template=feature_request.yml). Describe the problem you're solving, not just the solution you want.

### Pull requests

1. Fork the repo and create a branch from `main`.
2. If you've added code, add or update tests where applicable.
3. Ensure `npm run lint` and `npm run build` pass.
4. Write a clear PR description using the template.
5. One concern per PR — keep changes focused and reviewable.

For large changes, open an issue first to discuss the approach.

## Project structure

```
src/
├── app/                    # Next.js App Router pages and API routes
│   ├── api/agents/         # Agent list endpoint
│   ├── api/health/         # Health check
│   └── api/copilotkit/     # Runtime endpoint (will become assistant-ui)
├── components/             # React components
│   ├── assistant-ui/       # assistant-ui styled elements (owned by project)
│   └── ui/                 # shadcn base components
└── lib/                    # Utilities (agent config, branding, runtime switch)
demo-agent/                 # Minimal AG-UI demo agent (Python/FastAPI)
helm/                       # Helm chart for OpenShift/Kubernetes
intent/                     # Product intent and spec docs
```

## Conventions

- **TypeScript strict mode** — no `any` unless unavoidable (and then with an eslint-disable comment).
- **Imports** — use `@/*` alias for `src/` imports. Group: external, internal, relative.
- **Components** — assistant-ui primitives in `components/assistant-ui/`, shadcn base in `components/ui/`.
- **Styling** — Tailwind CSS only. Dark theme via `.dark` class on `<html>`. No inline styles.
- **API routes** — Next.js App Router route handlers in `src/app/api/`.
- **Environment variables** — descriptive names, documented in `.env.example`.
- **Commits** — conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`.
- **Comments** — only when explaining non-obvious *why*. Never narrate what the code does.

## Adding a new agent adapter

Any Agent supports multiple protocols via assistant-ui runtime adapters. To add support for a new agent framework:

1. Add the assistant-ui adapter package (e.g., `@assistant-ui/react-<framework>`).
2. Add a new protocol type in `src/lib/agents.ts`.
3. Wire the runtime in `src/lib/runtime-switch.ts`.
4. Add a demo agent in `demo-agent/` or document the connection in `docs/`.
5. Update README with the new framework in the supported list.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
