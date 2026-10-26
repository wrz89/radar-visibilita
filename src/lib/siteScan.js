// Lettura della home del sito tramite la funzione "site-scan" (Supabase Edge Function).
// L'indirizzo è pubblico per natura: la funzione accetta solo richieste da questo sito e ha un limite per IP.

export const SCAN_URL = "https://tzkzeimwoeqxlqbuuaqp.supabase.co/functions/v1/site-scan";
const TIMEOUT_MS = 40000;

class ScanError extends Error {}

const MESSAGES = {
  http_403: "Il sito blocca la lettura automatica (protezione anti-bot).",
  http_404: "La home del sito non risponde (pagina non trovata).",
  timeout: "Il sito ha risposto troppo lentamente.",
  unreachable: "Non riesco a raggiungere il sito.",
  not_html: "L'indirizzo non restituisce una pagina web.",
  blocked_host: "Indirizzo non consentito.",
  rate_limited: "Troppe analisi ravvicinate: riprova tra qualche minuto.",
  bad_url: "Indirizzo del sito non valido.",
};

function messageFor(code) {
  if (MESSAGES[code]) return MESSAGES[code];
  if (/^http_\d+$/.test(code || "")) return `Il sito ha risposto con un errore (${code.slice(5)}).`;
  return "Lettura del sito non riuscita.";
}

export async function scanSite(domain) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(SCAN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "https://" + domain }),
      signal: ctrl.signal,
    });
    const json = await res.json().catch(() => ({}));
    if (!json.ok) throw new ScanError(messageFor(json.error || (res.status === 429 ? "rate_limited" : "")));
    return json;
  } catch (e) {
    if (e instanceof ScanError) throw e;
    if (e.name === "AbortError") throw new ScanError(MESSAGES.timeout);
    throw new ScanError("Lettura del sito non riuscita (connessione).");
  } finally {
    clearTimeout(timer);
  }
}

// Frase che spiega cosa è stato letto sul sito per un controllo verificato in automatico.
export function scanNote(id, s) {
  if (!s) return null;
  switch (id) {
    case "seo2":
      return `Letto nella home: ${s.h1.count} H1${s.h1.first ? ` («${s.h1.first.slice(0, 70)}»)` : ""}. Ne serve uno solo.`;
    case "seo6":
      return s.schemaTypes.length
        ? `Letto nella home: dati strutturati ${s.schemaTypes.slice(0, 4).join(", ")}.`
        : "Letto nella home: nessun dato strutturato utile (LocalBusiness, Organization, Product, FAQ).";
    case "seo7":
      return "Letto: nessuna sitemap in robots.txt né agli indirizzi /sitemap.xml e /wp-sitemap.xml.";
    case "ct3":
      return `Letto nella home: modulo di contatto con ${s.forms.minFields} campi (l'ideale è al massimo 5).`;
    case "ct6":
      return "Letto nella home: nessun tag di Google Analytics o Google Tag Manager.";
    case "so6":
      return "Letto nella home: nessun link ai profili social.";
    case "ux5":
      return "Letto nella home: nessun numero cliccabile, link WhatsApp o pulsante di contatto.";
    default:
      return null;
  }
}
