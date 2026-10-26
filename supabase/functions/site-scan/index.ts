// Edge Function "site-scan": legge la home di un sito e restituisce i segnali utili all'audit.
// Pubblica ma limitata: accetta solo richieste dai siti consentiti, con limite di richieste per IP
// e protezioni contro l'uso verso indirizzi interni. Non salva nulla e non restituisce l'HTML.
import { analyzeHtml, deriveChecks } from "./analyze.ts";

const ALLOWED_ORIGINS = new Set([
  "https://wrz89.github.io",
  "http://localhost:5173",
  "http://localhost:4173",
]);
const UA = "Mozilla/5.0 (compatible; RadarVisibilitaBot/1.0; +https://wrz89.github.io/radar-visibilita/)";
const MAX_HTML = 1_500_000;
const HTML_TIMEOUT = 12_000;
const PROBE_TIMEOUT = 5_000;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 20;

const hits = new Map<string, number[]>();

function corsHeaders(origin: string): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "content-type, authorization, apikey, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function json(body: unknown, status: number, origin: string): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...(origin ? corsHeaders(origin) : {}) },
  });
}

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < RATE_WINDOW_MS)) hits.delete(k);
  return list.length > RATE_MAX;
}

function isPrivateIp(ip: string): boolean {
  const p = ip.split(".").map(Number);
  if (p.length !== 4 || p.some((n) => Number.isNaN(n))) return false;
  const [a, b] = p;
  return (
    a === 0 || a === 10 || a === 127 || a >= 224 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 100 && b >= 64 && b <= 127)
  );
}

function parseTarget(raw: string): URL | null {
  let u: URL;
  try {
    u = new URL(/^https?:\/\//i.test(raw) ? raw : "https://" + raw);
  } catch {
    return null;
  }
  const h = u.hostname.toLowerCase();
  if (!/^https?:$/.test(u.protocol)) return null;
  if (!h.includes(".") || h.endsWith(".local") || h.endsWith(".internal") || h === "localhost") return null;
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(h) || h.includes(":") || h.startsWith("[")) return null;
  if (u.port && !["80", "443"].includes(u.port)) return null;
  return u;
}

async function assertPublic(u: URL): Promise<void> {
  if (!parseTarget(u.href)) throw new Error("blocked_host");
  try {
    const ips = await Deno.resolveDns(u.hostname, "A");
    if (ips.some(isPrivateIp)) throw new Error("blocked_host");
  } catch (e) {
    if (e instanceof Error && e.message === "blocked_host") throw e;
    /* DNS non risolvibile o non disponibile: ci pensa il fetch a fallire */
  }
}

async function readCapped(res: Response, maxBytes: number): Promise<string> {
  if (!res.body) return "";
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (total < maxBytes) {
    const { done, value } = await reader.read();
    if (done || !value) break;
    chunks.push(value);
    total += value.length;
  }
  await reader.cancel().catch(() => {});
  const all = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) {
    all.set(c, off);
    off += c.length;
  }
  return new TextDecoder("utf-8", { fatal: false }).decode(all);
}

async function fetchLimited(start: URL, maxBytes: number, timeoutMs: number, accept: string) {
  let u = start;
  for (let hop = 0; hop < 5; hop++) {
    await assertPublic(u);
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(u, {
        redirect: "manual",
        signal: ctrl.signal,
        headers: { "user-agent": UA, accept, "accept-language": "it-IT,it;q=0.9,en;q=0.5" },
      });
      const loc = res.headers.get("location");
      if (res.status >= 300 && res.status < 400 && loc) {
        await res.body?.cancel().catch(() => {});
        u = new URL(loc, u);
        continue;
      }
      const text = await readCapped(res, maxBytes);
      return { res, text, finalUrl: u };
    } finally {
      clearTimeout(timer);
    }
  }
  throw new Error("too_many_redirects");
}

async function probe(path: string, origin: URL): Promise<string | null> {
  try {
    const r = await fetchLimited(new URL(path, origin), 300_000, PROBE_TIMEOUT, "text/plain,application/xml,*/*");
    if (r.res.status !== 200) return null;
    if (/^\s*<(!doctype|html)/i.test(r.text)) return null; // pagina di errore travestita
    return r.text;
  } catch {
    return null;
  }
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin") ?? "";
  const allowed = ALLOWED_ORIGINS.has(origin);

  if (req.method === "OPTIONS") {
    return allowed ? new Response(null, { status: 204, headers: corsHeaders(origin) }) : new Response(null, { status: 403 });
  }
  if (!allowed) return json({ ok: false, error: "origin_not_allowed" }, 403, "");
  if (req.method !== "POST") return json({ ok: false, error: "method_not_allowed" }, 405, origin);

  const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  if (rateLimited(ip)) return json({ ok: false, error: "rate_limited" }, 429, origin);

  let target: URL | null = null;
  try {
    const body = await req.json();
    target = parseTarget(String(body?.url ?? "").trim());
  } catch {
    /* corpo non valido */
  }
  if (!target) return json({ ok: false, error: "bad_url" }, 400, origin);

  try {
    const { res, text, finalUrl } = await fetchLimited(target, MAX_HTML, HTML_TIMEOUT, "text/html,application/xhtml+xml");
    if (res.status >= 400) return json({ ok: false, error: `http_${res.status}` }, 200, origin);
    const ctype = res.headers.get("content-type") ?? "";
    if (ctype && !/html|xml/i.test(ctype)) return json({ ok: false, error: "not_html" }, 200, origin);

    const analysis = analyzeHtml(text, finalUrl.href);

    const robots = await probe("/robots.txt", finalUrl);
    let sitemapUrl = "";
    if (robots) {
      const m = /^\s*sitemap:\s*(\S+)/im.exec(robots);
      if (m) sitemapUrl = m[1];
    }
    let sitemapFound = Boolean(sitemapUrl);
    if (!sitemapFound) {
      for (const path of ["/sitemap.xml", "/wp-sitemap.xml", "/sitemap_index.xml"]) {
        const body = await probe(path, finalUrl);
        if (body && /<urlset|<sitemapindex/i.test(body)) {
          sitemapFound = true;
          sitemapUrl = new URL(path, finalUrl).href;
          break;
        }
      }
    }

    return json(
      {
        ok: true,
        finalUrl: finalUrl.href,
        status: res.status,
        ...analysis,
        robots: { found: robots !== null },
        sitemap: { found: sitemapFound, url: sitemapUrl },
        checks: deriveChecks(analysis, sitemapFound),
      },
      200,
      origin,
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "blocked_host") return json({ ok: false, error: "blocked_host" }, 200, origin);
    if (e instanceof DOMException && e.name === "AbortError") return json({ ok: false, error: "timeout" }, 200, origin);
    return json({ ok: false, error: "unreachable" }, 200, origin);
  }
});
