// Temporary: lists which setting names this deployment can see (names only, never values).
export async function onRequestGet({ env }) {
  const names = Object.keys(env).map((k) => JSON.stringify(k));
  return new Response(JSON.stringify({ names }), { headers: { "content-type": "application/json", "cache-control": "no-store" } });
}
