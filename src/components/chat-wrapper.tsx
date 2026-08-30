"use client";

import { useState, useEffect, useMemo, type FC, type ReactNode } from "react";
import Image from "next/image";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useAgUiRuntime } from "@assistant-ui/react-ag-ui";
import { useLangGraphRuntime } from "@assistant-ui/react-langgraph";
import { useChatRuntime } from "@assistant-ui/ai-sdk";
import { AssistantChatTransport } from "@assistant-ui/ai-sdk";
import { useAdkRuntime, createAdkStream } from "@assistant-ui/react-google-adk";
import { HttpAgent } from "@ag-ui/client";
import { Thread } from "@/components/assistant-ui/elements/thread.aui";
import { ThreadList } from "@/components/assistant-ui/elements/thread-list.aui";
import { AgentSelector } from "@/components/agent-selector";
import type { AgentInfo, AgentProtocol } from "@/lib/agents";
import type { LangGraphMessagesEvent } from "@assistant-ui/react-langgraph";
import { WeatherToolUI } from "@/lib/tool-uis";
import {
  WebSpeechSynthesisAdapter,
  WebSpeechDictationAdapter,
  SimpleImageAttachmentAdapter,
  SimpleTextAttachmentAdapter,
  CompositeAttachmentAdapter,
} from "@assistant-ui/react";
import { createThreadPersistenceAdapter } from "@/lib/thread-persistence";

type Branding = {
  title: string;
  logoUrl: string;
};

type AgentsResponse = {
  agents: AgentInfo[];
  defaultAgent: string;
};

const attachmentAdapter = new CompositeAttachmentAdapter([
  new SimpleImageAttachmentAdapter(),
  new SimpleTextAttachmentAdapter(),
]);

const speechAdapter = new WebSpeechSynthesisAdapter();
const dictationAdapter = new WebSpeechDictationAdapter();
const threadListAdapter = createThreadPersistenceAdapter();

const RuntimeShell: FC<{ children?: ReactNode }> = ({ children }) => (
  <div className="flex h-full">
    <aside className="hidden w-64 shrink-0 border-r border-border bg-card md:block">
      <div className="flex h-full flex-col gap-1 p-2">
        <ThreadList />
      </div>
    </aside>
    <div className="flex-1 min-w-0">
      <Thread />
    </div>
    <WeatherToolUI />
    {children}
  </div>
);

// --- AG-UI runtime (default) ---
function AgUiChat({ agentUrl }: { agentUrl: string }) {
  const agent = useMemo(() => new HttpAgent({ url: agentUrl }), [agentUrl]);
  const runtime = useAgUiRuntime({
    agent,
    adapters: {
      speech: speechAdapter,
      dictation: dictationAdapter,
      attachments: attachmentAdapter,
    },
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <RuntimeShell />
    </AssistantRuntimeProvider>
  );
}

// --- LangGraph runtime ---
function langGraphStreamFactory(agentUrl: string) {
  return async function* (
    messages: unknown[],
    config: { abortSignal: AbortSignal },
  ): AsyncGenerator<LangGraphMessagesEvent<unknown>> {
    const response = await fetch(agentUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify({ messages }),
      signal: config.abortSignal,
    });

    if (!response.ok) throw new Error(`LangGraph error: ${response.status}`);
    if (!response.body) throw new Error("No response body");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      let currentEvent = "";
      for (const line of lines) {
        if (line.startsWith("event: ")) {
          currentEvent = line.slice(7).trim();
        } else if (line.startsWith("data: ") && currentEvent) {
          try {
            const data = JSON.parse(line.slice(6));
            yield { event: currentEvent, data } as LangGraphMessagesEvent<unknown>;
          } catch {
            // skip malformed JSON
          }
          currentEvent = "";
        }
      }
    }
  };
}

function LangGraphChat({ agentUrl }: { agentUrl: string }) {
  const streamFn = useMemo(() => langGraphStreamFactory(agentUrl), [agentUrl]);
  const runtime = useLangGraphRuntime({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    stream: streamFn as any,
    unstable_threadListAdapter: threadListAdapter,
    adapters: {
      speech: speechAdapter,
      dictation: dictationAdapter,
      attachments: attachmentAdapter,
    },
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <RuntimeShell />
    </AssistantRuntimeProvider>
  );
}

// --- OpenAI-compatible runtime (Vercel AI SDK) ---
function OpenAiChat({ agentUrl }: { agentUrl: string }) {
  const transport = useMemo(
    () => new AssistantChatTransport({ api: agentUrl }),
    [agentUrl],
  );
  const runtime = useChatRuntime({
    transport,
    adapters: {
      speech: speechAdapter,
      dictation: dictationAdapter,
      attachments: attachmentAdapter,
    },
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <RuntimeShell />
    </AssistantRuntimeProvider>
  );
}

// --- Google ADK runtime ---
function GoogleAdkChat({ agentUrl }: { agentUrl: string }) {
  const stream = useMemo(() => createAdkStream({ api: agentUrl }), [agentUrl]);
  const runtime = useAdkRuntime({
    stream,
    sessionAdapter: threadListAdapter,
    adapters: {
      speech: speechAdapter,
      dictation: dictationAdapter,
      attachments: attachmentAdapter,
    },
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <RuntimeShell />
    </AssistantRuntimeProvider>
  );
}

const PROTOCOL_COMPONENTS: Record<AgentProtocol, FC<{ agentUrl: string }>> = {
  "ag-ui": AgUiChat,
  langgraph: LangGraphChat,
  openai: OpenAiChat,
  "google-adk": GoogleAdkChat,
};

export function ChatWrapper({ branding }: { branding: Branding }) {
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [currentAgent, setCurrentAgent] = useState<AgentInfo | null>(null);

  useEffect(() => {
    fetch("/api/agents")
      .then((res) => res.json())
      .then((data: AgentsResponse) => {
        setAgents(data.agents);
        const defaultAgent = data.agents.find(
          (a) => a.id === data.defaultAgent,
        );
        setCurrentAgent(defaultAgent || data.agents[0] || null);
      });
  }, []);

  if (!currentAgent) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse text-muted-foreground">
          Loading agents...
        </div>
      </div>
    );
  }

  const ChatComponent =
    PROTOCOL_COMPONENTS[currentAgent.protocol] ?? AgUiChat;

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between px-6 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          {branding.logoUrl && (
            <Image
              src={branding.logoUrl}
              alt=""
              width={32}
              height={32}
              className="h-8 w-8"
              unoptimized
            />
          )}
          <h1 className="text-lg font-semibold text-foreground">
            {branding.title}
          </h1>
        </div>
        <AgentSelector
          agents={agents}
          onAgentChange={setCurrentAgent}
          currentAgentId={currentAgent.id}
        />
      </header>
      <main className="flex-1 overflow-hidden">
        <ChatComponent key={currentAgent.id} agentUrl={currentAgent.url} />
      </main>
    </div>
  );
}
