import { MODELS, CATEGORIES } from "../data/audit.js";
import { fmtMs, fmtCls } from "./psi.js";
import { TIME } from "../data/explain.js";
import { TYPE_LABEL } from "./channels.js";

export function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function seeded(seed) {
  return function () {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function normalizeDomain(v) {
  return v.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "");
}

// Simulazione deterministica: stesso dominio + modello = stesso risultato.
export function simulate(domain, model) {
  const r = seeded(hashStr(domain + "|" + model));
  const maturity = 0.35 + r() * 0.35;
  const status = {};
  CATEGORIES.forEach((c) => {
    const catBias = maturity + (r() - 0.5) * 0.35;
    c.checks.forEach((k) => {
      const p = catBias + (k.effort === 1 ? 0.08 : 0) - (k.effort === 3 ? 0.12 : 0);
      status[k.id] = r() < p;
    });
  });
  return status;
}

export function categoryScore(cat, status) {
  const total = cat.checks.reduce((a, k) => a + k.impact, 0);
  const ok = cat.checks.reduce((a, k) => a + (status[k.id] ? k.impact : 0), 0);
  return Math.round((ok / total) * 100);
}

export function overallScore(model, status) {
  let s = 0;
  let w = 0;
  CATEGORIES.forEach((c) => {
    s += categoryScore(c, status) * c.weights[model];
    w += c.weights[model];
  });
  return Math.round(s / w);
}

export function band(score) {
  if (score >= 75) return { label: "Solido", tone: "good", desc: "Ben messa: mantieni il livello e ricontrolla ogni trimestre.", globalDesc: "La presenza online è ben impostata: ora conta mantenerla e colmare le ultime lacune." };
  if (score >= 50) return { label: "Da rafforzare", tone: "warn", desc: "Buone basi, ma ci sono lacune che frenano i risultati: parti dai problemi ad alta priorità.", globalDesc: "Buone basi, ma alcune lacune frenano contatti e vendite: con pochi interventi mirati il punteggio sale in fretta." };
  return { label: "Critico", tone: "bad", desc: "Oggi frena la visibilità: è qui che conviene intervenire per primo.", globalDesc: "Oggi si perdono molte occasioni di essere trovati e scelti: serve intervenire sulle basi prima di investire in pubblicità." };
}

export const TONE = {
  good: { text: "text-good", soft: "bg-good-soft", stroke: "var(--good)", bar: "bg-good" },
  warn: { text: "text-warn", soft: "bg-warn-soft", stroke: "var(--warn)", bar: "bg-warn" },
  bad: { text: "text-bad", soft: "bg-bad-soft", stroke: "var(--bad)", bar: "bg-bad" },
};

export const LEVEL = { 1: "Basso", 2: "Medio", 3: "Alto" };

export function failedChecks(status, model) {
  const out = [];
  CATEGORIES.forEach((c) =>
    c.checks.forEach((k) => {
      if (!status[k.id]) out.push({ ...k, cat: c, weight: c.weights[model] });
    })
  );
  return out;
}

export function quickWins(status, model) {
  const failed = failedChecks(status, model);
  const priority = (k) => k.impact * 10 + k.weight / 10 - k.effort * 6;
  let wins = failed.filter((k) => k.effort === 1 && k.impact >= 2);
  if (wins.length < 3) wins = wins.concat(failed.filter((k) => k.effort === 2 && k.impact === 3));
  return wins.sort((a, b) => priority(b) - priority(a)).slice(0, 4);
}

export const CHECK_BY_ID = Object.fromEntries(CATEGORIES.flatMap((c) => c.checks.map((k) => [k.id, k])));
export const TOTAL_CHECKS = Object.keys(CHECK_BY_ID).length;

export function verifiedCount(result) {
  return Object.keys(result.status).filter((id) => (result.auto && result.auto[id]) || (result.manual && result.manual[id])).length;
}

export function priorityOf(k) {
  if ((k.impact === 3 && k.effort <= 2) || (k.impact === 2 && k.effort === 1)) return { label: "Priorità alta", tone: "bad" };
  if (k.impact === 1 && k.effort >= 2) return { label: "Priorità bassa", tone: "low" };
  return { label: "Priorità media", tone: "warn" };
}

// Riepilogo in linguaggio semplice: cosa funziona, cosa non va, da dove partire.
export function buildSummary(result) {
  const { model, status } = result;
  const subject = result.display || result.domain;
  const score = overallScore(model, status);
  const b = band(score);
  const areas = CATEGORIES.map((c) => ({ c, s: categoryScore(c, status) }));
  const best = [...areas].sort((x, y) => y.s - x.s)[0];
  const worst = [...areas].sort((x, y) => x.s - y.s)[0];
  const tail = {
    good: "è solida",
    warn: "ha buone basi, ma con lacune che frenano contatti e vendite",
    bad: "è critica: oggi si perdono molte occasioni di essere trovati e scelti",
  }[b.tone];
  const headline = `La visibilità online di ${subject} ${tail} (${score}/100). Il punto più forte è ${best.c.name} (${best.s}), il più debole è ${worst.c.name} (${worst.s}).`;

  const problems = failedChecks(status, model)
    .sort((x, y) => y.impact * y.weight - x.impact * x.weight || x.effort - y.effort)
    .slice(0, 3);

  const strengths = [];
  CATEGORIES.forEach((c) =>
    c.checks.forEach((k) => {
      if (status[k.id]) strengths.push({ ...k, cat: c, weight: c.weights[model] });
    })
  );
  strengths.sort((x, y) => y.impact * y.weight - x.impact * x.weight);

  const start = quickWins(status, model)[0] || problems[0] || null;
  return { headline, problems, strengths: strengths.slice(0, 3), start };
}

export function buildPlan(result) {
  const { model, status } = result;
  const display = result.display || result.domain;
  const modelLabel = MODELS.find((m) => m.id === model).label;
  const score = overallScore(model, status);
  const summary = buildSummary(result);
  const wins = quickWins(status, model);
  const winIds = new Set(wins.map((k) => k.id));
  const failed = failedChecks(status, model).filter((k) => !winIds.has(k.id));
  const mid = failed.filter((k) => k.impact >= 2 && k.effort <= 2);
  const midIds = new Set(mid.map((k) => k.id));
  const late = failed.filter((k) => !midIds.has(k.id));
  const date = new Date().toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" });

  const L = [];
  L.push("PIANO D'AZIONE – VISIBILITÀ ONLINE");
  L.push(`Azienda: ${display}`);
  if (result.web) L.push(`Sito web: ${result.web}`);
  (result.channels || []).forEach((c) => L.push(`${TYPE_LABEL[c.type] || "Canale"}: ${c.url || c.label}${c.discovered ? " (trovato nel sito)" : ""}`));
  L.push(`Modello di business: ${modelLabel}`);
  L.push(`Data: ${date}`);
  L.push(`Affidabilità dei dati: ${verifiedCount(result)} controlli su ${TOTAL_CHECKS} verificati, gli altri sono stimati.`);
  L.push("");
  L.push(`PUNTEGGIO GLOBALE: ${score}/100 (${band(score).label})`);
  CATEGORIES.forEach((c) => {
    const s = categoryScore(c, status);
    L.push(`- ${c.name}: ${s}/100 · peso ${c.weights[model]}%`);
  });
  if (result.psi) {
    const p = result.psi;
    L.push("");
    L.push("DATI REALI PAGESPEED INSIGHTS (mobile)");
    L.push(`- Performance ${p.perf ?? "n.d."}/100 · SEO tecnica ${p.seo ?? "n.d."}/100 · Best practice ${p.bestPractices ?? "n.d."}/100`);
    L.push(`- LCP ${fmtMs(p.lcp)} (${p.lcpSource}) · CLS ${fmtCls(p.cls)} (${p.clsSource}) · ${p.inp != null ? "INP " + p.inp + " ms (utenti reali)" : "TBT " + (p.tbt != null ? Math.round(p.tbt) + " ms (laboratorio)" : "n.d.")}`);
  }
  if (result.scan) {
    const x = result.scan;
    L.push("");
    L.push("LETTURA DEL SITO (home page)");
    L.push(`- H1: ${x.h1.count} · dati strutturati: ${x.schemaTypes.length ? x.schemaTypes.slice(0, 4).join(", ") : "nessuno"} · sitemap: ${x.sitemap.found ? "sì" : "no"}`);
    L.push(`- Modulo contatto: ${x.forms.minFields === null ? "nessuno" : x.forms.minFields + " campi"} · tracciamento: ${x.analytics.ga4 || x.analytics.gtm || x.analytics.ua ? "presente" : "assente"} · social collegati: ${x.socials.length}`);
    if (x.jsRendered) L.push("- Il sito carica i contenuti con JavaScript: lettura parziale.");
  }
  L.push("");
  L.push("IN SINTESI");
  L.push(summary.headline);
  if (summary.strengths.length) {
    L.push("Cosa funziona:");
    summary.strengths.forEach((k) => L.push(`- ${k.label}`));
  }
  if (summary.problems.length) {
    L.push("Cosa non va (i problemi che pesano di più):");
    summary.problems.forEach((k, i) => {
      L.push(`${i + 1}. ${k.label}: ${k.fail}`);
      L.push(`   Perché conta: ${k.why}`);
    });
  }
  L.push("");
  L.push("FASE 1 · 0-30 GIORNI – QUICK WINS");
  if (wins.length === 0) L.push("- Nessun intervento rapido aperto.");
  wins.forEach((k, i) => {
    L.push(`${i + 1}. [${k.cat.short}] ${k.fix}`);
    L.push(`   Perché: ${k.why}`);
    k.how.forEach((h, j) => L.push(`   ${String.fromCharCode(97 + j)}) ${h}`));
    L.push(`   Tempo indicativo: ${TIME[k.effort]}`);
  });
  L.push("");
  L.push("FASE 2 · 30-60 GIORNI – INTERVENTI STRUTTURALI");
  if (mid.length === 0) L.push("- Nessun intervento in questa fase.");
  mid.forEach((k) => {
    L.push(`- [${k.cat.short}] ${k.fix} (${priorityOf(k).label.toLowerCase()}, tempo indicativo: ${TIME[k.effort]})`);
    L.push(`  Perché: ${k.why}`);
  });
  L.push("");
  L.push("FASE 3 · 60-90 GIORNI – CONSOLIDAMENTO");
  if (late.length === 0) L.push("- Nessun intervento in questa fase.");
  late.forEach((k) => {
    L.push(`- [${k.cat.short}] ${k.fix} (${priorityOf(k).label.toLowerCase()}, tempo indicativo: ${TIME[k.effort]})`);
    L.push(`  Perché: ${k.why}`);
  });
  L.push("");
  L.push("INDICAZIONI STRATEGICHE PER AREA");
  [...CATEGORIES]
    .sort((a, b) => b.weights[model] - a.weights[model])
    .forEach((c) => {
      L.push(`${c.name}:`);
      L.push(`  ${c.advice[model]}`);
    });
  return L.join("\n");
}
