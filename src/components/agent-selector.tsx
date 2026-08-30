"use client";

import { useState, useEffect } from "react";
import type { AgentProtocol } from "@/lib/agents";

export type AgentInfo = {
  id: string;
  name: string;
  description: string;
  protocol: AgentProtocol;
  url: string;
};

type AgentSelectorProps = {
  onAgentChange: (agent: AgentInfo) => void;
  currentAgentId: string;
};

export function AgentSelector({ onAgentChange, currentAgentId }: AgentSelectorProps) {
  const [agents, setAgents] = useState<AgentInfo[]>([]);

  useEffect(() => {
    fetch("/api/agents")
      .then((res) => res.json())
      .then((data: { agents: AgentInfo[] }) => {
        setAgents(data.agents);
      });
  }, []);

  if (agents.length <= 1) return null;

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="agent-select" className="text-sm text-muted-foreground">
        Agent:
      </label>
      <select
        id="agent-select"
        value={currentAgentId}
        onChange={(e) => {
          const selected = agents.find((a) => a.id === e.target.value);
          if (selected) onAgentChange(selected);
        }}
        className="rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
      >
        {agents.map((agent) => (
          <option key={agent.id} value={agent.id}>
            {agent.name}
          </option>
        ))}
      </select>
    </div>
  );
}
