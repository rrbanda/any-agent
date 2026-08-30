export type AgentConfig = {
  url: string;
  name: string;
  description?: string;
};

export type AgentsMap = Record<string, AgentConfig>;

export function getAgentsConfig(): AgentsMap {
  const raw = process.env.AGENTS;
  if (!raw) {
    return {
      demo: {
        url: "http://localhost:8000",
        name: "Demo Agent",
        description: "A demo AG-UI agent",
      },
    };
  }
  try {
    return JSON.parse(raw) as AgentsMap;
  } catch {
    console.error("Failed to parse AGENTS env var:", raw);
    return {};
  }
}

export function getDefaultAgent(): string {
  return process.env.DEFAULT_AGENT || Object.keys(getAgentsConfig())[0] || "demo";
}
