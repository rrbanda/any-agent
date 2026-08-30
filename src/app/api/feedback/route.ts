import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    messageId: string;
    vote: "up" | "down";
    comment?: string;
  };

  if (!body.messageId || !body.vote) {
    return NextResponse.json(
      { error: "messageId and vote are required" },
      { status: 400 },
    );
  }

  if (db.enabled) {
    const feedback = await db.createFeedback(
      body.messageId,
      body.vote,
      body.comment,
    );
    return NextResponse.json(feedback);
  }

  return NextResponse.json({
    id: "in-memory",
    messageId: body.messageId,
    vote: body.vote,
    comment: body.comment,
  });
}
