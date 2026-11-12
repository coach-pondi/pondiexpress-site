// Comment moderation API, protected by the ADMIN_KEY secret (sent as the X-Admin-Key header).
// GET  /api/admin/comments?status=pending|approved -> list
// POST /api/admin/comments {id, action: "approve" | "delete"}
import { ensureSchema, json, sameSecret, configError } from "../../_lib/comments.js";

async function authorised(request, env) {
  if (!env.ADMIN_KEY) return false;
  return sameSecret(request.headers.get("X-Admin-Key") || "", env.ADMIN_KEY);
}

export async function onRequestGet({ request, env }) {
  const problem = configError(env);
  if (problem) return json({ error: problem }, 503);
  if (!(await authorised(request, env))) return json({ error: "Wrong password." }, 401);
  await ensureSchema(env.DB);
  const status = new URL(request.url).searchParams.get("status") === "approved" ? "approved" : "pending";
  const order = status === "pending" ? "ASC" : "DESC";
  const { results } = await env.DB.prepare(
    `SELECT id, post, name, body, status, created_at FROM comments WHERE status = ? ORDER BY created_at ${order} LIMIT 300`
  ).bind(status).all();
  return json({ comments: results });
}

export async function onRequestPost({ request, env }) {
  const problem = configError(env);
  if (problem) return json({ error: problem }, 503);
  if (!(await authorised(request, env))) return json({ error: "Wrong password." }, 401);
  let data;
  try { data = await request.json(); } catch { return json({ error: "Bad request." }, 400); }
  const id = Number(data.id);
  if (!Number.isInteger(id) || id < 1) return json({ error: "Bad comment id." }, 400);
  await ensureSchema(env.DB);
  if (data.action === "approve") {
    await env.DB.prepare("UPDATE comments SET status = 'approved' WHERE id = ?").bind(id).run();
  } else if (data.action === "delete") {
    await env.DB.prepare("DELETE FROM comments WHERE id = ?").bind(id).run();
  } else {
    return json({ error: "Unknown action." }, 400);
  }
  return json({ ok: true });
}
