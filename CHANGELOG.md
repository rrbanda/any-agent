# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project structure with Next.js and assistant-ui
- AG-UI protocol support via `@assistant-ui/react-ag-ui`
- Multi-agent selector with environment variable configuration
- Demo AG-UI echo agent (Python/FastAPI)
- Dark theme with shadcn/ui tokens
- Docker, Docker Compose, and Helm chart for deployment
- CI pipeline (lint, build, gitleaks)
- Branding via environment variables (title, logo, primary color)
- Full assistant-ui component parity (thread, thread list, markdown, reasoning, tool groups, attachments, suggestions)
- **Multi-protocol runtime adapters**:
  - `@assistant-ui/react-langgraph` for native LangGraph agents
  - `@assistant-ui/ai-sdk` for OpenAI-compatible endpoints (Hermes, vLLM)
  - `@assistant-ui/react-google-adk` for Google ADK agents
- Protocol-based runtime auto-switch in `chat-wrapper.tsx` (each protocol is a separate component)
- `google-adk` added to `AgentProtocol` union type
- **Thread persistence** via PostgreSQL (`pg` package):
  - CRUD API routes: `/api/threads`, `/api/threads/[id]`, `/api/threads/[id]/messages`
  - `RemoteThreadListAdapter` wiring in `src/lib/thread-persistence.ts`
  - SQL schema in `prisma/schema.sql`
  - Graceful fallback to in-memory when `DATABASE_URL` is not set
- **File upload** endpoint: `POST /api/upload` with local storage
- **Feedback** endpoint: `POST /api/feedback` for message thumbs up/down
- **Browser-native speech**: `WebSpeechSynthesisAdapter` (TTS) and `WebSpeechDictationAdapter` (STT) on all runtimes
- **Custom tool UI**: `WeatherToolUI` example using `makeAssistantToolUI`
- **Enhanced demo agent**:
  - Tool call results via `ToolCallResultEvent`
  - Three demo tools: `get_current_time`, `get_weather`, `search_knowledge_base`
  - Rich markdown response with tables and code blocks
- Multi-protocol agent examples in `.env.example`
- Adapter-specific guidance in `.cursor/rules/assistant-ui.mdc`
