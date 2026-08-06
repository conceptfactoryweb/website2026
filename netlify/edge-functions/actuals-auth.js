// HTTP Basic Auth voor /actuals — vertrouwelijke cijfers.
// Logins in Netlify env var ACTUALS_CREDS: komma- of newline-gescheiden "user:pass".
function readEnv(name){
  try { if (typeof Netlify !== "undefined" && Netlify.env) return Netlify.env.get(name) || ""; } catch(_){}
  try { if (typeof Deno !== "undefined" && Deno.env) return Deno.env.get(name) || ""; } catch(_){}
  return "";
}
export default async (request, context) => {
  const raw = readEnv("ACTUALS_CREDS") || readEnv("ACTUALS_CRED");
  const map = {};
  raw.split(/[,\n]/).forEach(pair => {
    const i = pair.indexOf(":");
    if (i > 0) { const u = pair.slice(0, i).trim(); const p = pair.slice(i + 1).trim(); if (u) map[u] = p; }
  });
  const configured = Object.keys(map).length;

  // Tijdelijke, veilige diagnose: onthult enkel het AANTAL logins, geen waarden.
  const url = new URL(request.url);
  if (url.searchParams.get("diag") === "1") {
    return new Response(JSON.stringify({ loginsConfigured: configured }), {
      status: 200, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
    });
  }

  const auth = request.headers.get("authorization") || "";
  let ok = false;
  if (configured && auth.startsWith("Basic ")) {
    try {
      const dec = atob(auth.slice(6));
      const j = dec.indexOf(":");
      const u = dec.slice(0, j), p = dec.slice(j + 1);
      ok = Object.prototype.hasOwnProperty.call(map, u) && map[u] === p;
    } catch(_) { ok = false; }
  }
  if (!ok) {
    return new Response("Authenticatie vereist.", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Concept Factory Actuals", charset="UTF-8"',
        "Cache-Control": "no-store"
      }
    });
  }
  return context.next();
};
