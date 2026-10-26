import { CHECK_BY_ID } from "../lib/scoring.js";
import { TYPE_LABEL, SOCIAL_TYPES } from "../lib/channels.js";

const GROUPS = [
  {
    id: "google",
    title: "Scheda Google",
    types: ["google"],
    checks: ["re1", "re2", "re3", "re6"],
    intro: "Apri la scheda e rispondi alle domande: bastano 2 minuti.",
    missing: "Nessun link alla scheda Google. Incollalo nel modulo in alto per verificarla qui: è l'area che pesa di più per le attività locali.",
  },
  {
    id: "social",
    title: "Profili social",
    types: SOCIAL_TYPES,
    checks: ["so1", "so2", "so3", "so4", "so5", "so6"],
    intro: "Apri i profili indicati e rispondi guardando gli ultimi post e i messaggi.",
    missing: "Nessun profilo social indicato. Incolla i link di Facebook, Instagram, LinkedIn o altri nel modulo in alto per verificarli qui.",
  },
];

function Source({ id, auto, manual }) {
  if (auto[id]) return <span className="rounded bg-accent-soft px-1.5 py-0.5 font-mono text-[10px] font-semibold text-accent">PSI</span>;
  if (manual[id]) return <span className="rounded bg-good-soft px-1.5 py-0.5 font-mono text-[10px] font-semibold text-good">Verificato</span>;
  return <span className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-muted">Stima</span>;
}

function YesNo({ id, value, onSet, label }) {
  const base = "h-8 min-w-[3rem] px-3 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent";
  return (
    <div className="inline-flex shrink-0 overflow-hidden rounded-lg border border-line" role="group" aria-label={label}>
      <button type="button" aria-pressed={value} onClick={() => onSet(id, true)} className={`${base} ${value ? "bg-good-soft text-good" : "bg-bg text-muted hover:text-ink"}`}>Sì</button>
      <button type="button" aria-pressed={!value} onClick={() => onSet(id, false)} className={`${base} border-l border-line ${!value ? "bg-bad-soft text-bad" : "bg-bg text-muted hover:text-ink"}`}>No</button>
    </div>
  );
}

export default function ChannelsPanel({ result, onSet }) {
  const channels = result.channels || [];
  const auto = result.auto || {};
  const manual = result.manual || {};
  const chips = [];
  if (result.web) chips.push({ type: "web", label: result.web, url: result.isExample ? "" : "https://" + result.web });
  channels.forEach((c) => chips.push(c));

  return (
    <section className="rounded-xl border border-line bg-surface p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-lg font-semibold">Canali analizzati e verifica rapida</h2>
        <span className="font-mono text-xs text-muted">le risposte aggiornano punteggi e piano</span>
      </div>

      {chips.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {chips.map((c, i) => (
            <li key={c.type + i}>
              {c.url ? (
                <a href={c.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-2 px-3 py-1 text-sm hover:border-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted">{TYPE_LABEL[c.type]}</span>
                  <span className="max-w-[16rem] truncate font-medium">{c.label}</span>
                  <span aria-hidden="true">↗</span>
                </a>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-2 px-3 py-1 text-sm">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted">{TYPE_LABEL[c.type]}</span>
                  <span className="max-w-[16rem] truncate font-medium">{c.label}</span>
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {GROUPS.map((g) => {
          const present = channels.some((c) => g.types.includes(c.type));
          return (
            <div key={g.id} className="min-w-0 rounded-lg border border-line p-4">
              <h3 className="font-display text-base font-semibold">{g.title}</h3>
              {!present ? (
                <p className="mt-2 text-sm text-muted">{g.missing}</p>
              ) : (
                <>
                  <p className="mt-1 text-sm text-muted">{g.intro}</p>
                  <ul className="mt-3 divide-y divide-line">
                    {g.checks.map((id) => {
                      const k = CHECK_BY_ID[id];
                      return (
                        <li key={id} className="flex items-center gap-3 py-2.5">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium">{k.label}</p>
                            <p className="mt-0.5"><Source id={id} auto={auto} manual={manual} /></p>
                          </div>
                          <YesNo id={id} value={Boolean(result.status[id])} onSet={onSet} label={k.label} />
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted">
        Google, Facebook e Instagram non permettono di leggere in automatico le loro pagine da un sito esterno: per questo la verifica è guidata. Il sito web, invece, viene misurato da PageSpeed Insights.
      </p>
    </section>
  );
}
