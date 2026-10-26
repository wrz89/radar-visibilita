// Riconoscimento dei link inseriti (sito, scheda Google, social) e raccolta dei campi del modulo.

export const TYPE_LABEL = {
  web: "Sito web",
  google: "Scheda Google",
  facebook: "Facebook",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
  youtube: "YouTube",
  x: "X",
  other: "Altro canale",
};

export const SOCIAL_TYPES = ["facebook", "instagram", "linkedin", "tiktok", "youtube", "x"];

const SKIP_SEGMENTS = new Set(["company", "in", "pages", "p", "profile.php", "channel", "c", "user", "school"]);

function handleFrom(pathname) {
  const parts = pathname.split("/").filter(Boolean);
  const first = parts.find((p) => !SKIP_SEGMENTS.has(p.toLowerCase()));
  return first ? decodeURIComponent(first) : "";
}

// Restituisce {type, label, url}. type "name" indica un testo che non è un link (nome azienda).
export function parseLink(raw) {
  const s = (raw || "").trim();
  if (!s) return null;
  if (!/[./]/.test(s)) return { type: "name", label: s };
  let u;
  try {
    u = new URL(/^https?:\/\//i.test(s) ? s : "https://" + s);
  } catch (e) {
    return { type: "name", label: s };
  }
  const host = u.hostname.toLowerCase();
  if (!host.includes(".")) return { type: "name", label: s };
  const bare = host.replace(/^(www|m|mobile|it-it)\./, "");
  const path = u.pathname;

  const social = [
    ["facebook", /(^|\.)(facebook\.com|fb\.com|fb\.me)$/],
    ["instagram", /(^|\.)(instagram\.com|instagr\.am)$/],
    ["linkedin", /(^|\.)(linkedin\.com|lnkd\.in)$/],
    ["tiktok", /(^|\.)tiktok\.com$/],
    ["youtube", /(^|\.)(youtube\.com|youtu\.be)$/],
    ["x", /(^|\.)(x\.com|twitter\.com)$/],
  ];
  for (const [type, re] of social) {
    if (re.test(bare)) {
      const handle = handleFrom(path);
      return { type, label: handle || TYPE_LABEL[type], url: u.href };
    }
  }

  const isGoogle =
    ["g.page", "maps.app.goo.gl", "g.co", "business.google.com", "share.google"].includes(host) ||
    (host === "goo.gl" && path.startsWith("/maps")) ||
    (/(^|\.)google\.[a-z.]+$/.test(host) && /^\/(maps|search|business|local|travel)/.test(path));
  if (isGoogle) return { type: "google", label: TYPE_LABEL.google, url: u.href };

  return { type: "web", label: bare, url: u.origin + "/" };
}

const looksLikeLink = (t) => /[./]/.test(t);

const LINK_FIELDS = ["web", "google", "facebook", "instagram", "linkedin", "other"];

// Unisce tutti i campi: ogni link viene riconosciuto e messo al posto giusto anche se
// incollato nel campo sbagliato. Nel campo "altro" si possono incollare più link.
export function collectInputs(fields) {
  let name = (fields.name || "").trim();
  let web = null;
  const channels = [];
  const seen = new Set();

  for (const key of LINK_FIELDS) {
    const raw = (fields[key] || "").trim();
    if (!raw) continue;
    const tokens = raw.split(/[\s,;]+/).filter(Boolean);
    const items = tokens.every(looksLikeLink) ? tokens : [raw];
    for (const item of items) {
      const p = parseLink(item);
      if (!p) continue;
      if (p.type === "name") {
        if (!name) name = p.label;
        continue;
      }
      if (seen.has(p.url)) continue;
      seen.add(p.url);
      if (p.type === "web") {
        if (!web) web = p.label;
        else channels.push({ ...p, type: "other" });
      } else {
        channels.push(p);
      }
    }
  }

  if (!name && !web && channels.length === 0) {
    return { error: "Inserisci almeno il sito, un link (scheda Google, Facebook, Instagram…) o il nome dell'azienda." };
  }
  return { name, web, channels };
}

export function displayName({ name, web, channels }) {
  return name || web || (channels && channels[0] && channels[0].label) || "Azienda";
}

// Chiave per rendere la simulazione stabile: stessi canali e modello, stesso risultato.
export function seedKey({ name, web, channels }) {
  return [web, ...(channels || []).map((c) => c.url).sort(), web ? "" : name].filter(Boolean).join("|");
}
