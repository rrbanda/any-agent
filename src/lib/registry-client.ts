import type { AgentConfig } from "./agents";

type RegistryArtifact = {
  name: string;
  kind: string;
  metadata?: {
    description?: string;
    url?: string;
    protocol?: string;
    [key: string]: unknown;
  };
};

/**
 * Fetch agent list from an agentregistry instance.
 * Returns null if AGENT_REGISTRY_URL is not set or the request fails,
 * allowing callers to fall back to the AGENTS env var.
 *
 * Expects the agentregistry REST API at:
 *   GET {AGENT_REGISTRY_URL}/api/v1/artifacts?kind=agent
 */
export async function fetchRegistryAgents(): Promise<Record<
  string,
  AgentConfig
> | null> {
  const registryUrl = process.env.AGENT_REGISTRY_URL;
  if (!registryUrl) return null;

  try {
    const base = registryUrl.replace(/\/+$/, "");
    const res = await fetch(`${base}/api/v1/artifacts?kind=agent`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 30 },
    });

    if (!res.ok) {
      console.warn(
        `[any-agent] Registry returned ${res.status} from ${base}`,
      );
      return null;
    }

    const data = (await res.json()) as { items?: RegistryArtifact[] };
    const items = data.items ?? [];

    const agents: Record<string, AgentConfig> = {};
    for (const item of items) {
      if (!item.metadata?.url) continue;
      const id = item.name.toLowerCase().replace(/[^a-z0-9-]/g, "-");
      agents[id] = {
        url: item.metadata.url,
        name: item.name,
        description: item.metadata.description,
        protocol: normalizeProtocol(item.metadata.protocol),
      };
    }

    return Object.keys(agents).length > 0 ? agents : null;
  } catch (err) {
    console.warn("[any-agent] Failed to fetch from agent registry:", err);
    return null;
  }
}

function normalizeProtocol(
  raw?: string,
): "ag-ui" | "langgraph" | "openai" | "google-adk" | undefined {
  if (!raw) return undefined;
  const lower = raw.toLowerCase().replace(/[\s_-]/g, "");
  if (lower.includes("langgraph")) return "langgraph";
  if (lower.includes("openai") || lower.includes("chatcompletions"))
    return "openai";
  if (lower.includes("adk") || lower.includes("a2a") || lower.includes("agentcard"))
    return "google-adk";
  if (lower.includes("agui")) return "ag-ui";
  return undefined;
}
