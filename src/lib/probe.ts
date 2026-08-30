import type { AgentProtocol } from "./agents";

/**
 * Probe an agent URL to auto-detect which protocol it speaks.
 * Tries well-known endpoints in order: A2A, OpenAI-compatible, LangGraph.
 * Falls back to "ag-ui" if nothing matches.
 */
export async function detectProtocol(
  url: string,
  timeoutMs = 3000,
): Promise<AgentProtocol> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);

  try {
    const base = url.replace(/\/+$/, "");

    // A2A agents expose an Agent Card at /.well-known/agent.json
    if (await probeOk(`${base}/.well-known/agent.json`, ctrl.signal)) {
      return "google-adk";
    }

    // OpenAI-compatible agents expose /v1/models
    if (await probeOk(`${base}/v1/models`, ctrl.signal)) {
      return "openai";
    }

    // LangGraph agents expose /threads or /assistants
    if (
      (await probeOk(`${base}/threads`, ctrl.signal)) ||
      (await probeOk(`${base}/assistants`, ctrl.signal))
    ) {
      return "langgraph";
    }

    return "ag-ui";
  } finally {
    clearTimeout(timer);
  }
}

async function probeOk(url: string, signal: AbortSignal): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: "GET",
      signal,
      headers: { Accept: "application/json" },
    });
    return res.ok;
  } catch {
    return false;
  }
}
