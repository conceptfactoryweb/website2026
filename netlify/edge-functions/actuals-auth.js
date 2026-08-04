// HTTP Basic Auth voor /actuals — vertrouwelijke cijfers.
// Eén of meerdere logins staan in de Netlify-omgevingsvariabele ACTUALS_CREDS,
// als komma-gescheiden "gebruiker:wachtwoord"-paren (niet in de repo).
// Voorbeeld: rob:geheim1,bjorn:geheim2
// Zonder geldige env var weigert de functie iedereen (fail-closed).
export default async (request, context) => {
  const raw = Netlify.env.get("ACTUALS_CREDS") || "";
  const allowed = raw.split(",").map(s => s.trim()).filter(Boolean);
  const auth = request.headers.get("authorization") || "";
  let ok = false;
  if (allowed.length && auth.startsWith("Basic ")) {
    try { ok = allowed.includes(atob(auth.slice(6))); } catch (_) { ok = false; }
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
