// Integrazione con PageSpeed Insights API v5 (gratuita, chiamata direttamente dal browser).
// La chiave arriva da VITE_PSI_API_KEY e va limitata per referrer HTTP nella console Google Cloud.

const ENDPOINT = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";
const TIMEOUT_MS = 90000;

export const PSI_KEY = import.meta.env.VITE_PSI_API_KEY || "";

// Restituisce l'URL da analizzare, oppure null se l'input è un nome azienda e non un dominio.
export function toUrl(domain) {
  const d = (domain || "").trim().toLowerCase();
  return /^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(d) ? "https://" + d : null;
}

class PsiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function callApi(url, key) {
  const params = new URLSearchParams({ url, strategy: "mobile", locale: "it", key });
  ["PERFORMANCE", "SEO", "BEST_PRACTICES"].forEach((c) => params.append("category", c));
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${ENDPOINT}?${params}`, { signal: ctrl.signal });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      const reason = json?.error?.message || "";
      if (res.status === 429) throw new PsiError("Quota PageSpeed esaurita: riprova tra qualche minuto.", 429);
      if (res.status === 403) throw new PsiError("Chiave non autorizzata per questo sito: controlla le restrizioni referrer e l'abilitazione dell'API.", 403);
      if (res.status === 400 && /key/i.test(reason)) throw new PsiError("Chiave API non valida.", 400);
      throw new PsiError("Google non è riuscito ad analizzare il sito (non raggiungibile o troppo lento).", res.status);
    }
    return json;
  } catch (e) {
    if (e.name === "AbortError") throw new PsiError("Analisi scaduta: il sito ha risposto troppo lentamente.", 0);
    if (e instanceof PsiError) throw e;
    throw new PsiError("Connessione a PageSpeed non riuscita.", 0);
  } finally {
    clearTimeout(timer);
  }
}

// Prova il dominio così com'è; se Google non lo raggiunge, riprova con www.
export async function fetchPsi(domain) {
  const url = toUrl(domain);
  if (!url || !PSI_KEY) throw new PsiError("Analisi reale non disponibile.", 0);
  let json;
  try {
    json = await callApi(url, PSI_KEY);
  } catch (e) {
    const retriable = e.status === 400 || e.status === 500;
    if (!retriable || domain.startsWith("www.")) throw e;
    json = await callApi("https://www." + domain, PSI_KEY);
  }
  return parsePsi(json);
}

const pct = (v) => (v == null ? null : Math.round(v * 100));

export function parsePsi(json) {
  const lr = json && json.lighthouseResult;
  if (!lr) throw new PsiError("Risposta di PageSpeed non valida.", 0);
  const audits = lr.audits || {};
  const cats = lr.categories || {};
  const field = (json.loadingExperience && json.loadingExperience.metrics) || {};
  const lab = (id) => (audits[id] ? audits[id].numericValue : undefined);
  const pass = (id) => (audits[id] && audits[id].score != null ? audits[id].score >= 0.9 : null);

  const lcpField = field.LARGEST_CONTENTFUL_PAINT_MS && field.LARGEST_CONTENTFUL_PAINT_MS.percentile;
  const clsField = field.CUMULATIVE_LAYOUT_SHIFT_SCORE && field.CUMULATIVE_LAYOUT_SHIFT_SCORE.percentile;
  const inpField = field.INTERACTION_TO_NEXT_PAINT && field.INTERACTION_TO_NEXT_PAINT.percentile;

  const lcp = lcpField != null ? lcpField : lab("largest-contentful-paint");
  const cls = clsField != null ? clsField / 100 : lab("cumulative-layout-shift");
  const tbt = lab("total-blocking-time");
  const inp = inpField != null ? inpField : null;

  // Controlli dell'audit che si possono verificare in automatico.
  const checks = {};
  if (lcp != null) checks.ux1 = lcp <= 2500;
  if (inp != null) checks.ux2 = inp <= 200;
  else if (tbt != null) checks.ux2 = tbt <= 200;
  if (cls != null) checks.ux3 = cls <= 0.1;
  const mobile = ["viewport", "font-size", "tap-targets"].map(pass).filter((v) => v !== null);
  if (mobile.length) checks.ux4 = mobile.every(Boolean);
  const https = pass("is-on-https");
  if (https !== null) checks.ux7 = https;
  const title = pass("document-title");
  const meta = pass("meta-description");
  if (title !== null && meta !== null) checks.seo1 = title && meta;

  return {
    perf: pct(cats.performance && cats.performance.score),
    seo: pct(cats.seo && cats.seo.score),
    bestPractices: pct(cats["best-practices"] && cats["best-practices"].score),
    lcp: lcp != null ? lcp : null,
    lcpSource: lcpField != null ? "utenti reali" : "laboratorio",
    cls: cls != null ? cls : null,
    clsSource: clsField != null ? "utenti reali" : "laboratorio",
    inp,
    tbt: tbt != null ? tbt : null,
    finalUrl: lr.finalUrl || null,
    checks,
  };
}

// Soglie Google: [buono, da migliorare]. Oltre la seconda soglia il valore è scarso.
const THRESHOLDS = { lcp: [2500, 4000], cls: [0.1, 0.25], inp: [200, 500], tbt: [200, 600] };

export function metricTone(kind, value) {
  if (value == null) return "warn";
  const [good, warn] = THRESHOLDS[kind];
  if (value <= good) return "good";
  if (value <= warn) return "warn";
  return "bad";
}

export function scoreTone(score) {
  if (score == null) return "warn";
  if (score >= 90) return "good";
  if (score >= 50) return "warn";
  return "bad";
}

export function fmtMs(ms) {
  return ms == null ? "n.d." : (ms / 1000).toLocaleString("it-IT", { maximumFractionDigits: 1 }) + " s";
}

export function fmtCls(v) {
  return v == null ? "n.d." : v.toLocaleString("it-IT", { maximumFractionDigits: 2 });
}
