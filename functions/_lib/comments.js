// Shared helpers for the blog comments API (Cloudflare Pages Functions + D1).

export const LIMITS = { name: 60, body: 3000, post: 200 };

let schemaReady = false;

// Creates the table the first time the API is used, so no manual SQL is needed.
export async function ensureSchema(db) {
  if (schemaReady) return;
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post TEXT NOT NULL,
      name TEXT NOT NULL,
      body TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL,
      ip_hash TEXT
    )`),
    db.prepare(`CREATE INDEX IF NOT EXISTS comments_post_status ON comments (post, status)`),
    db.prepare(`CREATE INDEX IF NOT EXISTS comments_status_created ON comments (status, created_at)`),
  ]);
  schemaReady = true;
}

export function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...extra },
  });
}

// Blog post paths only, e.g. /blog/ironman-goa-703-2026/
export function cleanPost(value) {
  if (typeof value !== "string") return null;
  const v = value.trim();
  if (v.length > LIMITS.post || !/^\/blog\/[a-z0-9-]+\/$/.test(v)) return null;
  return v;
}

export function cleanText(value, max) {
  if (typeof value !== "string") return "";
  // drop control characters except newlines and tabs, collapse runs of blank lines
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").replace(/\r\n?/g, "\n").replace(/\n{3,}/g, "\n\n").trim().slice(0, max);
}

export async function sha256(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function sameSecret(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || !a || !b) return false;
  const [ha, hb] = await Promise.all([sha256(a), sha256(b)]);
  let diff = 0;
  for (let i = 0; i < ha.length; i++) diff |= ha.charCodeAt(i) ^ hb.charCodeAt(i);
  return diff === 0;
}

export function configError(env) {
  if (!env.DB) return "The comments database is not connected (binding DB).";
  return null;
}
