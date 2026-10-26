import { TONE, band, categoryScore } from "../lib/scoring.js";
import { TIME } from "../data/explain.js";
import { measuredNote } from "../lib/psi.js";
import { scanNote } from "../lib/siteScan.js";
import Pill from "./Pill.jsx";
import Level from "./Level.jsx";
import Priority from "./Priority.jsx";

function Tag({ auto, manual }) {
  if (auto === "scan") return <span className="ml-2 rounded bg-accent-soft px-1.5 py-0.5 align-middle font-mono text-[10px] font-semibold text-accent" title="Letto dalla home del sito">SITO</span>;
  if (auto) return <span className="ml-2 rounded bg-accent-soft px-1.5 py-0.5 align-middle font-mono text-[10px] font-semibold text-accent" title="Verificato con dati reali di PageSpeed Insights">PSI</span>;
  if (manual) return <span className="ml-2 rounded bg-good-soft px-1.5 py-0.5 align-middle font-mono text-[10px] font-semibold text-good" title="Verificato da te">Verificato</span>;
  return null;
}

export default function CategoryCard({ cat, model, status, auto = {}, manual = {}, psi = null, scan = null, open, onToggle, onFlip }) {
  const score = categoryScore(cat, status);
  const b = band(score);
  const failed = cat.checks.filter((k) => !status[k.id]).length;
  return (
    <section className="rounded-xl border border-line bg-surface">
      <button
        type="button" onClick={onToggle} aria-expanded={open}
        className="flex w-full items-center gap-4 px-4 py-4 text-left sm:px-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded-xl"
      >
        <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-lg font-display text-lg font-bold tabular-nums ${TONE[b.tone].soft} ${TONE[b.tone].text}`}>{score}</span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-base font-semibold text-ink sm:text-lg">{cat.name}</span>
          <span className="mt-0.5 block text-sm text-muted">
            Peso {cat.weights[model]}% · {failed === 0 ? "nessun problema aperto" : `${failed} ${failed === 1 ? "problema rilevato" : "problemi rilevati"}`}
          </span>
        </span>
        <span className="hidden sm:block"><Pill tone={b.tone}>{b.label}</Pill></span>
        <svg className={`h-5 w-5 shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 8l5 5 5-5" /></svg>
      </button>

      {open && (
        <div className="grid gap-5 border-t border-line px-4 pb-5 pt-4 sm:px-5 lg:grid-cols-[1fr_320px]">
          <div className="min-w-0">
            <p className="mb-3 text-sm text-muted">{b.desc}</p>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Insights e problemi rilevati</h4>
            <ul className="divide-y divide-line">
              {cat.checks.map((k) => {
                const ok = status[k.id];
                const note = auto[k.id] === "scan" ? scanNote(k.id, scan) : auto[k.id] ? measuredNote(k.id, psi) : null;
                return (
                  <li key={k.id} className="flex gap-3 py-3">
                    <button
                      type="button" onClick={() => onFlip(k.id)}
                      title="Clicca per correggere dopo la verifica"
                      className={`mt-0.5 h-6 shrink-0 rounded-md px-2 text-xs font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${ok ? "bg-good-soft text-good" : "bg-bad-soft text-bad"}`}
                    >
                      {ok ? "OK" : "KO"}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-ink">
                        {k.label}
                        <Tag auto={auto[k.id]} manual={manual[k.id]} />
                      </p>
                      {!ok && <p className="mt-1 text-sm text-muted">{k.fail}</p>}
                      {note && <p className="mt-1 font-mono text-xs text-ink">{note}</p>}
                      {!ok && (
                        <>
                          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                            <Priority k={k} />
                            <Level label="Impatto" value={k.impact} />
                            <Level label="Sforzo" value={k.effort} />
                          </div>
                          <details className="mt-2">
                            <summary className="cursor-pointer rounded text-sm font-medium text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent">Perché conta e come risolvere</summary>
                            <div className="mt-2 grid gap-3 rounded-lg bg-surface-2 p-3 text-sm">
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted">Perché conta</p>
                                <p className="mt-1 text-ink">{k.why}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted">Come risolvere</p>
                                <ol className="mt-1 grid list-decimal gap-1 pl-5 text-ink">
                                  {k.how.map((h) => <li key={h}>{h}</li>)}
                                </ol>
                              </div>
                              <p className="text-xs text-muted">Tempo indicativo: {TIME[k.effort]}</p>
                            </div>
                          </details>
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          <aside className="h-fit rounded-lg bg-accent-soft p-4">
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-accent">Consiglio strategico</h4>
            <p className="text-sm leading-relaxed text-ink">{cat.advice[model]}</p>
          </aside>
        </div>
      )}
    </section>
  );
}
