"use client";

import { useState, useEffect } from "react";

type AgentInfo = {
  id: string;
  name: string;
  description: string;
};

type AgentSelectorProps = {
  onAgentChange: (agentId: string) => void;
  currentAgent: string;
};

export function AgentSelector({ onAgentChange, currentAgent }: AgentSelectorProps) {
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
      <label htmlFor="agent-select" className="text-sm text-zinc-400">
        Agent:
      </label>
      <select
        id="agent-select"
        value={currentAgent}
        onChange={(e) => onAgentChange(e.target.value)}
        className="bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[var(--app-primary)]"
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
