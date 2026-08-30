import { NextResponse } from "next/server";
import { db } from "@/lib/db";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteParams) {
  if (!db.enabled) {
    return NextResponse.json(
      { error: "Persistence not configured" },
      { status: 503 },
    );
  }

  const { id: threadId } = await params;
  const body = (await request.json()) as {
    role: string;
    content: unknown;
  };

  const message = await db.createMessage(threadId, body.role, body.content);
  return NextResponse.json(message);
}
