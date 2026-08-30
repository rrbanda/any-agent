# Any Agent - Universal Agent UI

## Commands
- Dev: `npm run dev` (starts Next.js on port 3000)
- Build: `npm run build`
- Lint: `npm run lint`
- Type check: `npx tsc --noEmit`

## Architecture
- Next.js 15 App Router with TypeScript
- CopilotKit v2 for AG-UI protocol chat UI
- Agents configured via `AGENTS` env var (JSON map of name -> {url, name, description})
- No paid CopilotKit Intelligence -- self-hosted only

## Key files
- `src/app/layout.tsx` - Root layout with CopilotKit provider
- `src/app/page.tsx` - Main chat page with agent selector
- `src/app/api/copilotkit/route.ts` - CopilotKit Runtime endpoint
- `src/lib/agents.ts` - Reads AGENTS env, creates HttpAgent instances
- `src/components/AgentSelector.tsx` - Dropdown to switch agents

## Conventions
- Use `@/*` import alias for `src/`
- All components in `src/components/`
- All lib/utility code in `src/lib/`
- API routes in `src/app/api/`
- Environment variables prefixed with nothing special, just descriptive names
- Use Tailwind CSS for styling

## Things to get right
- CopilotKit v2 uses `@copilotkit/react-core/v2` and `@copilotkit/runtime/v2`
- HttpAgent from `@ag-ui/client` connects to AG-UI endpoints
- The runtime must use `createCopilotRuntimeHandler` from `@copilotkit/runtime/v2`
- Agent switching works by passing `agent` prop to CopilotKit provider
- Never hardcode agent URLs -- always read from AGENTS env var
