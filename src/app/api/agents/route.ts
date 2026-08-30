import { NextResponse } from "next/server";
import { resolveAgents, getDefaultAgent } from "@/lib/agents";

export async function GET() {
  const agents = await resolveAgents();
  const defaultAgent = getDefaultAgent();

  return NextResponse.json({ agents, defaultAgent });
}
