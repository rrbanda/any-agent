"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";
import { AgentSelector } from "./AgentSelector";

type Branding = {
  title: string;
  logoUrl: string;
  primaryColor: string;
};

type AgentsResponse = {
  agents: { id: string; name: string; description: string }[];
  defaultAgent: string;
};

export function ChatWrapper({ branding }: { branding: Branding }) {
  const [agent, setAgent] = useState<string>("");

  useEffect(() => {
    fetch("/api/agents")
      .then((res) => res.json())
      .then((data: AgentsResponse) => {
        setAgent(data.defaultAgent);
      });
  }, []);

  if (!agent) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse text-zinc-400">Loading agents...</div>
      </div>
    );
  }

  return (
    <CopilotKit runtimeUrl="/api/copilotkit" agent={agent}>
      <div className="flex flex-col h-screen">
        <header className="flex items-center justify-between px-6 py-3 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            {branding.logoUrl && (
              <Image src={branding.logoUrl} alt="" width={32} height={32} className="h-8 w-8" unoptimized />
            )}
            <h1 className="text-lg font-semibold">{branding.title}</h1>
          </div>
          <AgentSelector onAgentChange={setAgent} currentAgent={agent} />
        </header>
        <main className="flex-1 relative">
          <CopilotSidebar
            defaultOpen={true}
            clickOutsideToClose={false}
            labels={{
              title: branding.title,
              initial: "Hi! I'm connected to your agent. How can I help?",
            }}
          />
        </main>
      </div>
    </CopilotKit>
  );
}
