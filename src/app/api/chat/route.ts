import { NextRequest } from "next/server";
import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

/**
 * Proxy route for OpenAI-compatible agents. Uses the Vercel AI SDK to
 * translate between assistant-ui's UI message stream protocol and the
 * upstream OpenAI-compatible endpoint (e.g. LiteLLM, vLLM, Ollama).
 */

const modelCache = new Map<string, string>();

async function resolveModel(baseURL: string): Promise<string> {
  const cached = modelCache.get(baseURL);
  if (cached) return cached;

  try {
    const res = await fetch(`${baseURL}/models`, {
      headers: { Accept: "application/json" },
    });
    if (res.ok) {
      const data = (await res.json()) as {
        data?: { id: string }[];
      };
      const modelId = data.data?.[0]?.id;
      if (modelId) {
        modelCache.set(baseURL, modelId);
        return modelId;
      }
    }
  } catch {
    // fall through
  }
  return "default";
}

export async function POST(req: NextRequest) {
  const agentUrl = req.nextUrl.searchParams.get("agentUrl");
  if (!agentUrl) {
    return new Response("Missing agentUrl query parameter", { status: 400 });
  }

  const body = await req.json();

  const url = new URL(agentUrl);
  const baseURL = `${url.protocol}//${url.host}${url.pathname.replace(/\/chat\/completions\/?$/, "")}`;

  const modelName = body.model || (await resolveModel(baseURL));

  const provider = createOpenAI({
    baseURL,
    apiKey: "not-needed",
  });

  const uiMessages: UIMessage[] = Array.isArray(body.messages)
    ? body.messages
    : [];

  const modelMessages = await convertToModelMessages(uiMessages);

  const result = await streamText({
    model: provider(modelName),
    messages: modelMessages,
  });

  return result.toUIMessageStreamResponse();
}
