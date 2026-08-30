import type { RemoteThreadListAdapter } from "@assistant-ui/core";

export function createThreadPersistenceAdapter(): RemoteThreadListAdapter {
  return {
    list: async () => {
      const res = await fetch("/api/threads");
      if (!res.ok) return { threads: [] };
      const data = await res.json();
      if (!data.persistence) return { threads: [] };

      return {
        threads: data.threads.map(
          (t: { id: string; title?: string; lastMessageAt?: string }) => ({
            status: "regular" as const,
            remoteId: t.id,
            title: t.title,
            lastMessageAt: t.lastMessageAt
              ? new Date(t.lastMessageAt)
              : undefined,
          }),
        ),
      };
    },

    initialize: async (threadId: string) => {
      const res = await fetch("/api/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: threadId }),
      });
      const data = await res.json();
      return { remoteId: data.id };
    },

    rename: async (remoteId: string, newTitle: string) => {
      await fetch(`/api/threads/${remoteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });
    },

    archive: async (remoteId: string) => {
      await fetch(`/api/threads/${remoteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: true }),
      });
    },

    unarchive: async (remoteId: string) => {
      await fetch(`/api/threads/${remoteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: false }),
      });
    },

    delete: async (remoteId: string) => {
      await fetch(`/api/threads/${remoteId}`, { method: "DELETE" });
    },

    fetch: async (remoteId: string) => {
      const res = await fetch(`/api/threads/${remoteId}`);
      const data = await res.json();
      return {
        status: data.archived ? ("archived" as const) : ("regular" as const),
        remoteId: data.id,
        title: data.title,
      };
    },

    generateTitle: async () => {
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue({
            path: [0],
            type: "part-start" as const,
            part: { type: "text" as const },
          });
          controller.enqueue({
            path: [0],
            type: "text-delta" as const,
            textDelta: "New conversation",
          });
          controller.enqueue({
            path: [0],
            type: "part-finish" as const,
          });
          controller.close();
        },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return stream as any;
    },
  };
}
