"use client";

import { ChevronDownIcon } from "lucide-react";
import type { AgentInfo } from "@/lib/agents";

type AgentSelectorProps = {
  agents: AgentInfo[];
  onAgentChange: (agent: AgentInfo) => void;
  currentAgentId: string;
};

export function AgentSelector({
  agents,
  onAgentChange,
  currentAgentId,
}: AgentSelectorProps) {
  return (
    <div className="aui-agent-selector pointer-events-auto relative inline-flex items-center">
      <select
        id="agent-select"
        value={currentAgentId}
        onChange={(e) => {
          const selected = agents.find((a) => a.id === e.target.value);
          if (selected) onAgentChange(selected);
        }}
        className="appearance-none cursor-pointer rounded-md bg-transparent pl-2 pr-6 py-0.5 text-xs font-medium text-muted-foreground hover:text-foreground focus:outline-none transition-colors"
        aria-label="Select agent"
      >
        {agents.map((agent) => (
          <option key={agent.id} value={agent.id}>
            {agent.name}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-1 size-3 text-muted-foreground" />
    </div>
  );
}
