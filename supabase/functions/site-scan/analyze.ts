// Estrae da una pagina HTML i segnali utili per l'audit di visibilità.
// Funzione pura: nessuna rete, così si può collaudare con pagine di esempio.

export interface Social {
  type: string;
  url: string;
  label: string;
}

const SOCIAL_HOSTS: [string, RegExp][] = [
  ["facebook", /(^|\.)(facebook\.com|fb\.com|fb\.me)$/],
  ["instagram", /(^|\.)(instagram\.com|instagr\.am)$/],
  ["linkedin", /(^|\.)(linkedin\.com|lnkd\.in)$/],
  ["tiktok", /(^|\.)tiktok\.com$/],
  ["youtube", /(^|\.)(youtube\.com|youtu\.be)$/],
  ["x", /(^|\.)(x\.com|twitter\.com)$/],
];

const GENERIC_SCHEMA = new Set([
  "WebSite", "WebPage", "BreadcrumbList", "ListItem", "ImageObject", "SearchAction", "ReadAction",
  "EntryPoint", "Person", "CollectionPage", "ItemList", "SiteNavigationElement", "WPHeader", "WPFooter",
  "WPSideBar", "Thing", "PropertyValue", "ContactPoint", "PostalAddress", "GeoCoordinates",
]);

function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_m, n) => String.fromCharCode(Number(n)));
}

function stripTags(html: string): string {
  return decodeEntities(html.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
}

function parseAttrs(tag: string): Record<string, string> {
  const out: Record<string, string> = {};
  const re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(tag))) out[m[1].toLowerCase()] = decodeEntities(m[2] ?? m[3] ?? m[4] ?? "");
  return out;
}

export function classifySocial(href: string, base: URL): Social | null {
  let u: URL;
  try {
    u = new URL(href, base);
  } catch {
    return null;
  }
  if (!/^https?:$/.test(u.protocol)) return null;
  const host = u.hostname.toLowerCase().replace(/^(www|m|mobile|it-it)\./, "");
  const path = u.pathname.replace(/\/+$/, "");
  const p = path.toLowerCase();
  for (const [type, re] of SOCIAL_HOSTS) {
    if (!re.test(host)) continue;
    if (!p) return null; // home del social, non un profilo
    if (type === "facebook" && /^\/(sharer|share|dialog|plugins|tr|login|policies|help|legal|groups$|events)/.test(p)) return null;
    if (type === "x" && /^\/(intent|share|home|i\/|search)/.test(p)) return null;
    if (type === "linkedin" && /^\/(sharearticle|sharing|share|login|signup|legal|help|feed)/.test(p)) return null;
    if (type === "instagram" && /^\/(p|reel|reels|explore|accounts|tv|stories)\//.test(p + "/")) return null;
    if (type === "youtube" && /^\/(watch|embed|shorts|playlist|results|feed|redirect)/.test(p)) return null;
    if (type === "tiktok" && /^\/(embed|share|video)/.test(p)) return null;
    const parts = path.split("/").filter(Boolean);
    const skip = new Set(["company", "in", "pages", "profile.php", "channel", "c", "user", "school"]);
    const handle = parts.find((s) => !skip.has(s.toLowerCase())) ?? parts[0];
    let label = handle;
    try {
      label = decodeURIComponent(handle);
    } catch {
      /* resta com'è */
    }
    const keepSearch = p === "/profile.php" ? u.search : "";
    return { type, url: u.origin + path + keepSearch, label };
  }
  return null;
}

function walkLd(node: unknown, types: Set<string>, sameAs: string[]): void {
  if (Array.isArray(node)) {
    node.forEach((n) => walkLd(n, types, sameAs));
    return;
  }
  if (!node || typeof node !== "object") return;
  const o = node as Record<string, unknown>;
  const t = o["@type"];
  if (typeof t === "string") types.add(t);
  else if (Array.isArray(t)) t.forEach((x) => typeof x === "string" && types.add(x));
  const s = o["sameAs"];
  if (typeof s === "string") sameAs.push(s);
  else if (Array.isArray(s)) s.forEach((x) => typeof x === "string" && sameAs.push(x));
  for (const k of Object.keys(o)) {
    const v = o[k];
    if (v && typeof v === "object") walkLd(v, types, sameAs);
  }
}

export function analyzeHtml(html: string, finalUrl: string) {
  const base = new URL(finalUrl);

  // Dati strutturati e tag di analisi si leggono prima di togliere gli script.
  const types = new Set<string>();
  const sameAs: string[] = [];
  for (const m of html.matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      walkLd(JSON.parse(m[1].trim()), types, sameAs);
    } catch {
      /* JSON-LD non valido: lo ignoro */
    }
  }
  for (const m of html.matchAll(/itemtype\s*=\s*["']https?:\/\/schema\.org\/([A-Za-z]+)/gi)) types.add(m[1]);

  const analytics = {
    ga4: /gtag\/js\?id=G-|["']G-[A-Z0-9]{8,}["']/.test(html),
    gtm: /googletagmanager\.com\/gtm\.js|["']GTM-[A-Z0-9]{4,}["']/.test(html),
    ua: /google-analytics\.com\/(analytics|ga)\.js|["']UA-\d+-\d+["']/.test(html),
    metaPixel: /connect\.facebook\.net\/[^"']*fbevents\.js|fbq\s*\(/.test(html),
  };

  const clean = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|noscript|template)\b[\s\S]*?<\/\1>/gi, "");

  const titleM = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(clean);
  const title = titleM ? stripTags(titleM[1]) : "";
  const langM = /<html[^>]*\blang\s*=\s*["']?([a-zA-Z-]+)/i.exec(clean);

  let metaDescription = "";
  let canonical = "";
  for (const m of clean.matchAll(/<meta\b[^>]*>/gi)) {
    const a = parseAttrs(m[0]);
    if ((a.name ?? "").toLowerCase() === "description" && !metaDescription) metaDescription = a.content ?? "";
  }
  for (const m of clean.matchAll(/<link\b[^>]*>/gi)) {
    const a = parseAttrs(m[0]);
    if ((a.rel ?? "").toLowerCase() === "canonical" && !canonical) canonical = a.href ?? "";
  }

  const h1s = [...clean.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => stripTags(m[1]));
  const h2Count = [...clean.matchAll(/<h2\b/gi)].length;

  const socialsAll: Social[] = [];
  const pushSocial = (href: string) => {
    const s = classifySocial(href, base);
    if (s && !socialsAll.some((x) => x.url.toLowerCase() === s.url.toLowerCase())) socialsAll.push(s);
  };
  let tel = false;
  let whatsapp = false;
  let email = false;
  let blogLink = false;
  let ctaFound = false;
  const CTA = /\b(prenota|prenotazione|richiedi|contatta|contattaci|chiama|preventivo|scrivici|acquista|compra|aggiungi al carrello)\b/i;
  const BLOG_PATH = /\/(blog|news|notizie|articoli|magazine|novita|novità)(\/|$|\?|#)/i;
  const BLOG_TEXT = /^(blog|news|notizie|articoli|novità|novita|magazine)$/i;

  for (const m of clean.matchAll(/(<a\b[^>]*>)([\s\S]*?)<\/a>/gi)) {
    const a = parseAttrs(m[1]);
    const href = (a.href ?? "").trim();
    const text = stripTags(m[2]);
    if (!href) continue;
    if (/^tel:/i.test(href)) tel = true;
    else if (/^mailto:/i.test(href)) email = true;
    else if (/^(https?:\/\/)?(wa\.me|api\.whatsapp\.com|wa\.link|web\.whatsapp\.com|chat\.whatsapp\.com)|^whatsapp:/i.test(href)) whatsapp = true;
    else pushSocial(href);
    if (CTA.test(text)) ctaFound = true;
    if (BLOG_PATH.test(href) || BLOG_TEXT.test(text)) blogLink = true;
  }
  for (const m of clean.matchAll(/<button\b[^>]*>([\s\S]*?)<\/button>/gi)) {
    if (CTA.test(stripTags(m[1]))) ctaFound = true;
  }
  sameAs.forEach(pushSocial);

  // Al massimo un profilo per canale: il primo trovato.
  const seenTypes = new Set<string>();
  const socials = socialsAll.filter((s) => (seenTypes.has(s.type) ? false : (seenTypes.add(s.type), true)));

  // Moduli di contatto: si ignorano ricerche e iscrizioni con un solo campo.
  const fieldCounts: number[] = [];
  for (const m of clean.matchAll(/<form\b([^>]*)>([\s\S]*?)<\/form>/gi)) {
    const fa = parseAttrs(m[1]);
    if (/search/i.test(`${fa.role ?? ""} ${fa.action ?? ""} ${fa.class ?? ""} ${fa.id ?? ""}`)) continue;
    let fields = 0;
    let textarea = false;
    let search = false;
    for (const f of m[2].matchAll(/<(input|textarea|select)\b[^>]*>/gi)) {
      const tag = f[1].toLowerCase();
      const a = parseAttrs(f[0]);
      const ty = (a.type ?? "text").toLowerCase();
      if (tag === "input" && ["hidden", "submit", "button", "image", "reset", "checkbox", "radio"].includes(ty)) continue;
      if (ty === "search") search = true;
      if (tag === "textarea") textarea = true;
      fields++;
    }
    if (search || (fields < 2 && !textarea)) continue;
    fieldCounts.push(fields);
  }

  const textLength = stripTags(clean).length;
  const scriptCount = (html.match(/<script\b/gi) ?? []).length;

  return {
    title,
    metaDescription,
    canonical,
    lang: langM ? langM[1] : "",
    h1: { count: h1s.length, first: h1s[0] ?? "" },
    h2Count,
    socials,
    contacts: { tel, whatsapp, email },
    schemaTypes: [...types].filter((t) => !GENERIC_SCHEMA.has(t)),
    forms: { count: fieldCounts.length, minFields: fieldCounts.length ? Math.min(...fieldCounts) : null },
    analytics,
    blogLink,
    ctaFound,
    textLength,
    // Pagina quasi vuota con script: i contenuti si caricano con JavaScript e l'HTML non basta.
    jsRendered: textLength < 400 && scriptCount >= 1,
  };
}

export type Analysis = ReturnType<typeof analyzeHtml>;

// Si impostano solo i controlli per cui la lettura dell'HTML è affidabile.
// Dove l'assenza di un segnale è sicura si imposta KO; dove la presenza non basta a dimostrare
// che il controllo è superato, non si imposta nulla e resta la stima.
export function deriveChecks(a: Analysis, sitemapFound: boolean | null): Record<string, boolean> {
  if (a.jsRendered) return {};
  const c: Record<string, boolean> = {};
  c.seo2 = a.h1.count === 1;
  c.seo6 = a.schemaTypes.length > 0;
  if (sitemapFound === false) c.seo7 = false;
  if (a.forms.minFields !== null) c.ct3 = a.forms.minFields <= 5;
  if (!a.analytics.ga4 && !a.analytics.gtm && !a.analytics.ua) c.ct6 = false;
  if (a.socials.length === 0) c.so6 = false;
  if (!a.contacts.tel && !a.contacts.whatsapp && !a.ctaFound) c.ux5 = false;
  return c;
}
