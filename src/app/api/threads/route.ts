import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  if (!db.enabled) {
    return NextResponse.json({ threads: [], persistence: false });
  }

  const threads = await db.listThreads();

  return NextResponse.json({
    threads: threads.map((t) => ({
      id: t.id,
      title: t.title,
      lastMessageAt: t.updated_at,
    })),
    persistence: true,
  });
}

export async function POST(request: Request) {
  if (!db.enabled) {
    return NextResponse.json(
      { error: "Persistence not configured" },
      { status: 503 },
    );
  }

  const body = (await request.json()) as { title?: string };
  const thread = await db.createThread(body.title);

  return NextResponse.json({ id: thread.id, title: thread.title });
}
