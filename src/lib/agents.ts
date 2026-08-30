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
        description: "A demo AG-UI echo agent",
      },
      researcher: {
        url: "http://localhost:8000",
        name: "Researcher",
        description: "Research assistant (demo)",
      },
    };
  }

  try {
    const parsed = JSON.parse(raw) as AgentsMap;
    const keys = Object.keys(parsed);
    if (keys.length === 0) {
      console.warn("[any-agent] AGENTS env var is an empty object -- no agents configured");
      return parsed;
    }
    for (const [key, config] of Object.entries(parsed)) {
      if (!config.url) {
        throw new Error(`Agent "${key}" is missing required "url" field`);
      }
      if (!config.name) {
        parsed[key].name = key;
      }
    }
    return parsed;
  } catch (err) {
    if (err instanceof SyntaxError) {
      console.error(
        "[any-agent] Failed to parse AGENTS env var. Expected JSON like:",
        '\'{"myagent":{"url":"http://host:8000","name":"My Agent"}}\'',
        "\nGot:",
        raw
      );
    } else {
      console.error("[any-agent]", err);
    }
    return {};
  }
}

export function getDefaultAgent(): string {
  return process.env.DEFAULT_AGENT || Object.keys(getAgentsConfig())[0] || "demo";
}
