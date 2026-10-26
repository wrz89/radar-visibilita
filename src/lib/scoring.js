import { MODELS, CATEGORIES } from "../data/audit.js";

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
  if (score >= 75) return { label: "Solido", tone: "good" };
  if (score >= 50) return { label: "Da rafforzare", tone: "warn" };
  return { label: "Critico", tone: "bad" };
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

export function buildPlan(result) {
  const { domain, model, status } = result;
  const modelLabel = MODELS.find((m) => m.id === model).label;
  const score = overallScore(model, status);
  const wins = quickWins(status, model);
  const winIds = new Set(wins.map((k) => k.id));
  const failed = failedChecks(status, model).filter((k) => !winIds.has(k.id));
  const mid = failed.filter((k) => k.impact >= 2 && k.effort <= 2);
  const midIds = new Set(mid.map((k) => k.id));
  const late = failed.filter((k) => !midIds.has(k.id));
  const date = new Date().toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" });

  const L = [];
  L.push(`PIANO D'AZIONE – VISIBILITÀ ONLINE`);
  L.push(`Azienda/dominio: ${domain}`);
  L.push(`Modello di business: ${modelLabel}`);
  L.push(`Data: ${date}`);
  L.push("");
  L.push(`PUNTEGGIO GLOBALE: ${score}/100 (${band(score).label})`);
  CATEGORIES.forEach((c) => {
    const s = categoryScore(c, status);
    L.push(`- ${c.name}: ${s}/100 · peso ${c.weights[model]}%`);
  });
  L.push("");
  L.push("FASE 1 · 0-30 GIORNI – QUICK WINS");
  if (wins.length === 0) L.push("- Nessun intervento rapido aperto.");
  wins.forEach((k, i) => L.push(`${i + 1}. [${k.cat.short}] ${k.fix}`));
  L.push("");
  L.push("FASE 2 · 30-60 GIORNI – INTERVENTI STRUTTURALI");
  if (mid.length === 0) L.push("- Nessun intervento in questa fase.");
  mid.forEach((k) => L.push(`- [${k.cat.short}] ${k.fix} (impatto ${LEVEL[k.impact].toLowerCase()}, sforzo ${LEVEL[k.effort].toLowerCase()})`));
  L.push("");
  L.push("FASE 3 · 60-90 GIORNI – CONSOLIDAMENTO");
  if (late.length === 0) L.push("- Nessun intervento in questa fase.");
  late.forEach((k) => L.push(`- [${k.cat.short}] ${k.fix}`));
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
