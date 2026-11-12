// Public comments API.
// GET  /api/comments?post=/blog/<slug>/  -> approved comments for that post
// POST /api/comments  {post, name, body, token, website} -> stored as pending until approved
import { LIMITS, ensureSchema, json, cleanPost, cleanText, sha256, configError } from "../_lib/comments.js";

export async function onRequestGet({ request, env }) {
  const problem = configError(env);
  if (problem) return json({ error: problem }, 503);
  const post = cleanPost(new URL(request.url).searchParams.get("post"));
  if (!post) return json({ error: "Unknown post." }, 400);
  await ensureSchema(env.DB);
  const { results } = await env.DB.prepare(
    "SELECT id, name, body, created_at FROM comments WHERE post = ? AND status = 'approved' ORDER BY created_at ASC LIMIT 500"
  ).bind(post).all();
  return json({ comments: results });
}

export async function onRequestPost({ request, env }) {
  const problem = configError(env);
  if (problem) return json({ error: problem }, 503);
  if (!env.TURNSTILE_SECRET) return json({ error: "Comments are not set up yet." }, 503);

  let data;
  try { data = await request.json(); } catch { return json({ error: "Something went wrong. Please try again." }, 400); }

  // honeypot field: people never see it, bots fill it in
  if (data.website) return json({ ok: true });

  const post = cleanPost(data.post);
  const name = cleanText(data.name, LIMITS.name);
  const body = cleanText(data.body, LIMITS.body);
  if (!post) return json({ error: "Unknown post." }, 400);
  if (!name) return json({ error: "Please add your name." }, 400);
  if (body.length < 2) return json({ error: "Please write a comment." }, 400);

  const ip = request.headers.get("CF-Connecting-IP") || "";
  const verify = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: new URLSearchParams({ secret: String(env.TURNSTILE_SECRET).trim(), response: String(data.token || ""), remoteip: ip }),
  }).then((r) => r.json()).catch(() => ({ success: false }));
  if (!verify.success) {
    const codes = (verify["error-codes"] || []).join(", ") || "no-response";
    console.log("turnstile failed", codes);
    return json({ error: "The robot check didn't go through. Please try again. (" + codes + ")" }, 400);
  }

  await ensureSchema(env.DB);
  const ipHash = await sha256(ip + "|" + env.TURNSTILE_SECRET);
  const recent = await env.DB.prepare(
    "SELECT COUNT(*) AS n FROM comments WHERE ip_hash = ? AND created_at > ?"
  ).bind(ipHash, new Date(Date.now() - 10 * 60 * 1000).toISOString()).first();
  if (recent && recent.n >= 5) return json({ error: "That's a lot of comments in a short time. Please try again in a few minutes." }, 429);

  await env.DB.prepare(
    "INSERT INTO comments (post, name, body, status, created_at, ip_hash) VALUES (?, ?, ?, 'pending', ?, ?)"
  ).bind(post, name, body, new Date().toISOString(), ipHash).run();

  return json({ ok: true });
}
