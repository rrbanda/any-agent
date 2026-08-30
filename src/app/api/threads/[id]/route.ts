import { NextResponse } from "next/server";
import { db } from "@/lib/db";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  if (!db.enabled) {
    return NextResponse.json(
      { error: "Persistence not configured" },
      { status: 503 },
    );
  }

  const { id } = await params;
  const thread = await db.getThread(id);

  if (!thread) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  }

  return NextResponse.json(thread);
}

export async function PATCH(request: Request, { params }: RouteParams) {
  if (!db.enabled) {
    return NextResponse.json(
      { error: "Persistence not configured" },
      { status: 503 },
    );
  }

  const { id } = await params;
  const body = (await request.json()) as {
    title?: string;
    archived?: boolean;
  };

  const thread = await db.updateThread(id, body);
  return NextResponse.json(thread);
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  if (!db.enabled) {
    return NextResponse.json(
      { error: "Persistence not configured" },
      { status: 503 },
    );
  }

  const { id } = await params;
  await db.deleteThread(id);

  return NextResponse.json({ ok: true });
}
