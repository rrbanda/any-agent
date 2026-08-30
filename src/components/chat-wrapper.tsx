"use client";

import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  type FC,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import {
  useRemoteThreadListRuntime,
  createLocalStorageAdapter,
  createSimpleTitleAdapter,
} from "@assistant-ui/core/react";
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

const asyncLocalStorage = {
  async getItem(key: string) {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(key);
  },
  async setItem(key: string, value: string) {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, value);
  },
  async removeItem(key: string) {
    if (typeof window === "undefined") return;
    localStorage.removeItem(key);
  },
};

type Branding = {
  title: string;
  logoUrl: string;
};

type AgentsResponse = {
  agents: AgentInfo[];
  defaultAgent: string;
};

type ChatProps = {
  agentUrl: string;
  agentSelector: ReactNode;
};

function RuntimeShell({ agentSelector }: { agentSelector: ReactNode }) {
  return (
    <div className="flex h-full">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card md:block">
        <div className="flex h-full flex-col gap-1 p-2">
          <ThreadList />
        </div>
      </aside>
      <div className="flex-1 min-w-0 [&_.aui-composer-action-wrapper]:gap-2">
        <Thread />
        <AgentSelectorPortal>{agentSelector}</AgentSelectorPortal>
      </div>
    </div>
  );
}

function AgentSelectorPortal({ children }: { children: ReactNode }) {
  const [slot, setSlot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    function ensureSlot() {
      const wrapper = document.querySelector<HTMLElement>(".aui-composer-action-wrapper");
      if (!wrapper) return;
      let el = wrapper.querySelector<HTMLElement>(".aui-agent-selector-slot");
      if (!el) {
        const rightGroup = wrapper.lastElementChild as HTMLElement | null;
        if (!rightGroup) return;
        el = document.createElement("div");
        el.className = "aui-agent-selector-slot flex items-center";
        rightGroup.insertBefore(el, rightGroup.firstChild);
      }
      setSlot((prev) => (prev === el ? prev : el));
    }

    ensureSlot();
    const observer = new MutationObserver(ensureSlot);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  if (!slot) return null;
  return createPortal(children, slot);
}

// --- In-memory thread store for AG-UI / LangGraph / ADK runtimes ---
type InMemoryThread = {
  id: string;
  title: string;
  messages: readonly import("@assistant-ui/core").ThreadMessage[];
};

let threadIdCounter = 0;
function nextThreadId() {
  return `thread-${++threadIdCounter}`;
}

function useInMemoryThreadStore() {
  const [threads, setThreads] = useState<InMemoryThread[]>(() => {
    const id = nextThreadId();
    return [{ id, title: "New Chat", messages: [] }];
  });
  const [activeId, setActiveId] = useState(threads[0].id);

  const saveMessages = useCallback(
    (msgs: readonly import("@assistant-ui/core").ThreadMessage[]) => {
      setThreads((prev) =>
        prev.map((t) => {
          if (t.id !== activeId) return t;
          const title =
            t.title === "New Chat"
              ? (msgs
                  .find((m) => m.role === "user")
                  ?.content.find(
                    (p): p is { type: "text"; text: string } =>
                      p.type === "text",
                  )
                  ?.text.slice(0, 50) ?? "New Chat")
              : t.title;
          return { ...t, messages: msgs, title };
        }),
      );
    },
    [activeId],
  );

  const switchToNew = useCallback(() => {
    const id = nextThreadId();
    setThreads((prev) => [...prev, { id, title: "New Chat", messages: [] }]);
    setActiveId(id);
  }, []);

  const switchTo = useCallback(
    (threadId: string) => {
      setActiveId(threadId);
      return threads.find((t) => t.id === threadId)?.messages ?? [];
    },
    [threads],
  );

  const rename = useCallback((threadId: string, newTitle: string) => {
    setThreads((prev) =>
      prev.map((t) => (t.id === threadId ? { ...t, title: newTitle } : t)),
    );
  }, []);

  const deleteThread = useCallback(
    (threadId: string) => {
      setThreads((prev) => {
        const filtered = prev.filter((t) => t.id !== threadId);
        if (filtered.length === 0) {
          const id = nextThreadId();
          return [{ id, title: "New Chat", messages: [] }];
        }
        return filtered;
      });
      if (activeId === threadId) {
        setThreads((prev) => {
          setActiveId(prev[0].id);
          return prev;
        });
      }
    },
    [activeId],
  );

  return { threads, activeId, saveMessages, switchToNew, switchTo, rename, deleteThread };
}

// --- AG-UI runtime (default) ---
function AgUiChat({ agentUrl, agentSelector }: ChatProps) {
  const agent = useMemo(() => new HttpAgent({ url: agentUrl }), [agentUrl]);
  const store = useInMemoryThreadStore();

  const runtime = useAgUiRuntime({
    agent,
    adapters: {
      threadList: {
        threads: store.threads.map((t) => ({
          id: t.id,
          status: "regular" as const,
          title: t.title,
        })),
        onSwitchToNewThread: async () => {
          store.switchToNew();
        },
        onSwitchToThread: async (threadId: string) => {
          const messages = store.switchTo(threadId);
          return { messages };
        },
        onRename: async (threadId: string, newTitle: string) => {
          store.rename(threadId, newTitle);
        },
        onDelete: async (threadId: string) => {
          store.deleteThread(threadId);
        },
      },
    },
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <RuntimeShell agentSelector={agentSelector} />
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

function LangGraphChat({ agentUrl, agentSelector }: ChatProps) {
  const streamFn = useMemo(() => langGraphStreamFactory(agentUrl), [agentUrl]);
  const runtime = useLangGraphRuntime({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    stream: streamFn as any,
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <RuntimeShell agentSelector={agentSelector} />
    </AssistantRuntimeProvider>
  );
}

// --- OpenAI-compatible runtime (Vercel AI SDK) ---
function OpenAiChat({ agentUrl, agentSelector }: ChatProps) {
  const transport = useMemo(
    () =>
      new AssistantChatTransport({
        api: `/api/chat?agentUrl=${encodeURIComponent(agentUrl)}`,
      }),
    [agentUrl],
  );

  const adapter = useMemo(() => {
    const base = createLocalStorageAdapter({
      storage: asyncLocalStorage,
      titleGenerator: createSimpleTitleAdapter(),
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { unstable_Provider, unstable_useAdapters, ...threadListOnly } =
      base;
    return threadListOnly;
  }, []);

  const runtime = useRemoteThreadListRuntime({
    runtimeHook: () => useChatRuntime({ transport }),
    adapter,
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <RuntimeShell agentSelector={agentSelector} />
    </AssistantRuntimeProvider>
  );
}

// --- Google ADK runtime ---
function GoogleAdkChat({ agentUrl, agentSelector }: ChatProps) {
  const stream = useMemo(() => createAdkStream({ api: agentUrl }), [agentUrl]);
  const runtime = useAdkRuntime({
    stream,
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <RuntimeShell agentSelector={agentSelector} />
    </AssistantRuntimeProvider>
  );
}

const PROTOCOL_COMPONENTS: Record<AgentProtocol, FC<ChatProps>> = {
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

  const agentSelector = (
    <AgentSelector
      agents={agents}
      onAgentChange={setCurrentAgent}
      currentAgentId={currentAgent.id}
    />
  );

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center px-6 py-3 border-b border-border shrink-0">
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
      </header>
      <main className="flex-1 overflow-hidden">
        <ChatComponent
          key={currentAgent.id}
          agentUrl={currentAgent.url}
          agentSelector={agentSelector}
        />
      </main>
    </div>
  );
}
