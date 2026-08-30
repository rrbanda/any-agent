import { detectProtocol } from "./probe";
import { fetchRegistryAgents } from "./registry-client";

export type AgentProtocol = "ag-ui" | "langgraph" | "openai" | "google-adk";

export type AgentConfig = {
  url: string;
  name: string;
  description?: string;
  protocol?: AgentProtocol;
};

export type AgentsMap = Record<string, AgentConfig>;

export type AgentInfo = {
  id: string;
  name: string;
  description: string;
  protocol: AgentProtocol;
  url: string;
};

export function getAgentsConfig(): AgentsMap {
  const raw = process.env.AGENTS;
  if (!raw) {
    return {
      demo: {
        url: "http://localhost:8000",
        name: "Demo Agent",
        description: "A demo AG-UI echo agent",
        protocol: "ag-ui",
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
        '\'{"myagent":{"url":"http://host:8000","name":"My Agent","protocol":"ag-ui"}}\'',
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

/**
 * Resolve agents with auto-detected protocols for any entries missing an
 * explicit protocol. Tries agentregistry first, falls back to AGENTS env.
 * Runs probe requests in parallel.
 */
export async function resolveAgents(): Promise<AgentInfo[]> {
  const registryAgents = await fetchRegistryAgents();
  const envAgents = getAgentsConfig();
  const configs = { ...envAgents, ...registryAgents };
  const entries = Object.entries(configs);

  const resolved = await Promise.all(
    entries.map(async ([id, config]) => {
      let protocol = config.protocol;
      if (!protocol) {
        try {
          protocol = await detectProtocol(config.url);
        } catch {
          protocol = "ag-ui";
        }
      }
      return {
        id,
        name: config.name || id,
        description: config.description || "",
        protocol,
        url: config.url,
      };
    }),
  );

  return resolved;
}
