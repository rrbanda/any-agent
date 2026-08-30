import {
  CopilotRuntime,
  createCopilotRuntimeHandler,
} from "@copilotkit/runtime/v2";
import { HttpAgent } from "@ag-ui/client";
import { NextRequest } from "next/server";
import { getAgentsConfig } from "@/lib/agents";

const agentsConfig = getAgentsConfig();

const agentEntries = Object.entries(agentsConfig);
if (agentEntries.length === 0) {
  throw new Error("No agents configured. Set the AGENTS environment variable.");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const agents: any = Object.fromEntries(
  agentEntries.map(([key, config]) => [key, new HttpAgent({ url: config.url })])
);

const runtime = new CopilotRuntime({ agents });
const handler = createCopilotRuntimeHandler({
  runtime,
  basePath: "/api/copilotkit",
});

export const POST = async (req: NextRequest) => handler(req);
export const GET = async (req: NextRequest) => handler(req);
