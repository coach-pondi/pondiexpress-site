// Temporary: shows which secrets this deployment can see and how long they are (never the values).
export async function onRequestGet({ env }) {
  const out = {};
  for (const k of ["ADMIN_KEY", "TURNSTILE_SECRET"]) out[k] = { type: typeof env[k], length: typeof env[k] === "string" ? env[k].length : null };
  return new Response(JSON.stringify(out), { headers: { "content-type": "application/json", "cache-control": "no-store" } });
}
