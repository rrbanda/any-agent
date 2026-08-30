import { NextResponse } from "next/server";
import { getAgentsConfig, getDefaultAgent } from "@/lib/agents";

export async function GET() {
  const agents = getAgentsConfig();
  const defaultAgent = getDefaultAgent();

  const publicAgents = Object.entries(agents).map(([key, config]) => ({
    id: key,
    name: config.name,
    description: config.description || "",
  }));

  return NextResponse.json({ agents: publicAgents, defaultAgent });
}
