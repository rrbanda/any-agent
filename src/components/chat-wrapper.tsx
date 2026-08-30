"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useAgUiRuntime } from "@assistant-ui/react-ag-ui";
import { HttpAgent } from "@ag-ui/client";
import { Thread } from "@/components/assistant-ui/thread";
import { AgentSelector } from "@/components/agent-selector";
import type { AgentInfo } from "@/lib/agents";

type Branding = {
  title: string;
  logoUrl: string;
};

type AgentsResponse = {
  agents: AgentInfo[];
  defaultAgent: string;
};

function AgUiChat({ agentUrl }: { agentUrl: string }) {
  const agent = useMemo(
    () => new HttpAgent({ url: agentUrl }),
    [agentUrl],
  );
  const runtime = useAgUiRuntime({ agent });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <Thread className="h-full" />
    </AssistantRuntimeProvider>
  );
}

export function ChatWrapper({ branding }: { branding: Branding }) {
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [currentAgent, setCurrentAgent] = useState<AgentInfo | null>(null);

  useEffect(() => {
    fetch("/api/agents")
      .then((res) => res.json())
      .then((data: AgentsResponse) => {
        setAgents(data.agents);
        const defaultAgent = data.agents.find((a) => a.id === data.defaultAgent);
        setCurrentAgent(defaultAgent || data.agents[0] || null);
      });
  }, []);

  if (!currentAgent) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse text-muted-foreground">Loading agents...</div>
      </div>
    );
  }

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
        <AgUiChat
          key={currentAgent.id}
          agentUrl={currentAgent.url}
        />
      </main>
    </div>
  );
}
