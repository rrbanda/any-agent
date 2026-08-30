import pg from "pg";

const { Pool } = pg;

let pool: pg.Pool | null = null;

function getPool(): pg.Pool | null {
  if (pool) return pool;
  if (!process.env.DATABASE_URL) return null;

  try {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    return pool;
  } catch {
    console.warn(
      "[any-agent] Failed to create PostgreSQL pool. Thread persistence disabled.",
    );
    return null;
  }
}

export type DbThread = {
  id: string;
  title: string | null;
  archived: boolean;
  created_at: Date;
  updated_at: Date;
};

export type DbMessage = {
  id: string;
  thread_id: string;
  role: string;
  content: unknown;
  created_at: Date;
};

export type DbFeedback = {
  id: string;
  message_id: string;
  vote: string;
  comment: string | null;
  created_at: Date;
};

export const db = {
  get enabled() {
    return !!getPool();
  },

  async listThreads(): Promise<DbThread[]> {
    const p = getPool();
    if (!p) return [];
    const { rows } = await p.query<DbThread>(
      `SELECT * FROM threads WHERE archived = false ORDER BY updated_at DESC`,
    );
    return rows;
  },

  async createThread(title?: string): Promise<DbThread> {
    const p = getPool()!;
    const { rows } = await p.query<DbThread>(
      `INSERT INTO threads (title) VALUES ($1) RETURNING *`,
      [title ?? null],
    );
    return rows[0];
  },

  async getThread(id: string): Promise<(DbThread & { messages: DbMessage[] }) | null> {
    const p = getPool()!;
    const { rows: threads } = await p.query<DbThread>(
      `SELECT * FROM threads WHERE id = $1`,
      [id],
    );
    if (threads.length === 0) return null;
    const { rows: messages } = await p.query<DbMessage>(
      `SELECT * FROM messages WHERE thread_id = $1 ORDER BY created_at ASC`,
      [id],
    );
    return { ...threads[0], messages };
  },

  async updateThread(
    id: string,
    data: { title?: string; archived?: boolean },
  ): Promise<DbThread> {
    const p = getPool()!;
    const sets: string[] = [];
    const vals: unknown[] = [];
    let idx = 1;

    if (data.title !== undefined) {
      sets.push(`title = $${idx++}`);
      vals.push(data.title);
    }
    if (data.archived !== undefined) {
      sets.push(`archived = $${idx++}`);
      vals.push(data.archived);
    }
    sets.push(`updated_at = now()`);
    vals.push(id);

    const { rows } = await p.query<DbThread>(
      `UPDATE threads SET ${sets.join(", ")} WHERE id = $${idx} RETURNING *`,
      vals,
    );
    return rows[0];
  },

  async deleteThread(id: string): Promise<void> {
    const p = getPool()!;
    await p.query(`DELETE FROM threads WHERE id = $1`, [id]);
  },

  async createMessage(
    threadId: string,
    role: string,
    content: unknown,
  ): Promise<DbMessage> {
    const p = getPool()!;
    const { rows } = await p.query<DbMessage>(
      `INSERT INTO messages (thread_id, role, content) VALUES ($1, $2, $3) RETURNING *`,
      [threadId, role, JSON.stringify(content)],
    );
    await p.query(`UPDATE threads SET updated_at = now() WHERE id = $1`, [
      threadId,
    ]);
    return rows[0];
  },

  async createFeedback(
    messageId: string,
    vote: string,
    comment?: string,
  ): Promise<DbFeedback> {
    const p = getPool()!;
    const { rows } = await p.query<DbFeedback>(
      `INSERT INTO feedback (message_id, vote, comment) VALUES ($1, $2, $3) RETURNING *`,
      [messageId, vote, comment ?? null],
    );
    return rows[0];
  },
};
