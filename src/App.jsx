import { useState, useEffect, useMemo } from "react";
import { MODELS, CATEGORIES, EXAMPLE } from "./data/audit.js";
import { simulate, normalizeDomain, categoryScore, overallScore, band, quickWins, buildPlan, failedChecks, TONE } from "./lib/scoring.js";
import Gauge from "./components/Gauge.jsx";
import Pill from "./components/Pill.jsx";
import Level from "./components/Level.jsx";
import CategoryCard from "./components/CategoryCard.jsx";
import LoadingPanel from "./components/LoadingPanel.jsx";

export default function App() {
  const [input, setInput] = useState("");
  const [model, setModel] = useState("b2c");
  const [phase, setPhase] = useState("done");
  const [progress, setProgress] = useState(0);
  const [pending, setPending] = useState(null);
  const [error, setError] = useState("");
  const [result, setResult] = useState(() => ({
    ...EXAMPLE,
    status: simulate(EXAMPLE.domain, EXAMPLE.model),
    isExample: true,
  }));
  const [openCat, setOpenCat] = useState("reputation");
  const [showPlan, setShowPlan] = useState(false);
  const [copyMsg, setCopyMsg] = useState("");

  const step = Math.floor((progress / 100) * LOADING_STEPS.length);

  useEffect(() => {
    if (phase !== "loading") return;
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const total = reduce ? 600 : 3600;
    const start = Date.now();
    const t = setInterval(() => {
      const p = Math.min(100, ((Date.now() - start) / total) * 100);
      setProgress(p);
      if (p >= 100) {
        clearInterval(t);
        const status = simulate(pending.domain, pending.model);
        const r = { ...pending, status, isExample: false };
        setResult(r);
        const weakest = [...CATEGORIES].sort((a, b) => categoryScore(a, status) - categoryScore(b, status))[0];
        setOpenCat(weakest.id);
        setShowPlan(false);
        setPhase("done");
      }
    }, 60);
    return () => clearInterval(t);
  }, [phase, pending]);

  function analyze(e) {
    e.preventDefault();
    const d = normalizeDomain(input);
    if (d.length < 3) {
      setError("Inserisci un dominio (es. nomeazienda.it) o il nome dell'azienda.");
      return;
    }
    setError("");
    setPending({ domain: d, model });
    setProgress(0);
    setPhase("loading");
  }

  function flip(id) {
    setResult((r) => ({ ...r, status: { ...r.status, [id]: !r.status[id] } }));
  }

  const score = useMemo(() => overallScore(result.model, result.status), [result]);
  const b = band(score);
  const wins = useMemo(() => quickWins(result.status, result.model), [result]);
  const plan = useMemo(() => buildPlan(result), [result]);
  const modelLabel = MODELS.find((m) => m.id === result.model).label;
  const totalFailed = failedChecks(result.status, result.model).length;

  function copyPlan() {
    const ta = document.getElementById("plan-text");
    const fallback = () => {
      if (ta) { ta.focus(); ta.select(); }
      setCopyMsg("Testo selezionato: premi Ctrl+C (o Cmd+C) per copiarlo.");
    };
    try {
      navigator.clipboard.writeText(plan).then(() => setCopyMsg("Piano copiato negli appunti."), fallback);
    } catch (err) {
      fallback();
    }
  }

  return (
    <div className="min-h-full bg-bg font-sans text-ink">
      <header className="border-b border-line bg-surface">
        <div className="wrap mx-auto flex max-w-6xl items-center gap-3 py-3">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-accent-ink" aria-hidden="true">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /><path d="M12 12l6-6" /></svg>
          </span>
          <span className="font-display text-base font-bold tracking-tight">Radar Visibilità</span>
          <span className="ml-auto hidden font-mono text-xs text-muted sm:block">Audit di consulenza digitale · 5 aree · 32 controlli</span>
        </div>
      </header>

      <main className="wrap mx-auto grid max-w-6xl gap-6 py-6 sm:py-8">
        {/* INPUT */}
        <form onSubmit={analyze} className="rounded-xl border border-line bg-surface p-4 sm:p-6">
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl" style={{ textWrap: "balance" }}>Audit di visibilità online</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">Inserisci il dominio o il nome dell'azienda e scegli il modello di business: pesi delle aree e consigli si adattano al contesto.</p>
          <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
              <label htmlFor="domain" className="grid gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted">Dominio o azienda</span>
                <input
                  id="domain" value={input} onChange={(e) => setInput(e.target.value)} placeholder="es. gommistaverdi.it"
                  disabled={phase === "loading"}
                  className="h-11 w-full rounded-lg border border-line bg-bg px-3 text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-soft"
                />
              </label>
              <fieldset className="grid gap-1.5">
                <legend className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted">Modello di business</legend>
                <div className="grid grid-cols-2 gap-1 rounded-lg bg-surface-2 p-1 sm:grid-cols-4">
                  {MODELS.map((m) => (
                    <button
                      key={m.id} type="button" onClick={() => setModel(m.id)} title={m.hint} aria-pressed={model === m.id}
                      disabled={phase === "loading"}
                      className={`h-9 rounded-md px-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${model === m.id ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"}`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>
            <button
              type="submit" disabled={phase === "loading"}
              className="h-11 rounded-lg bg-accent px-6 font-semibold text-accent-ink transition-opacity hover:opacity-90 disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {phase === "loading" ? "Analisi in corso…" : "Analizza Visibilità"}
            </button>
          </div>
          {error && <p className="mt-3 text-sm font-medium text-bad">{error}</p>}
        </form>

        {phase === "loading" && pending && <LoadingPanel domain={pending.domain} progress={progress} step={step} />}

        {phase === "done" && (
          <>
            {result.isExample && (
              <p className="rounded-lg border border-line bg-surface-2 px-4 py-3 text-sm text-muted">
                <strong className="text-ink">Esempio dimostrativo</strong> su un'officina locale fittizia. Inserisci un dominio sopra per avviare la tua analisi.
              </p>
            )}

            {/* SINTESI */}
            <section className="grid gap-4 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
              <div className="flex flex-col items-center rounded-xl border border-line bg-surface p-5 text-center">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">Punteggio globale</p>
                <div className="my-2"><Gauge score={score} /></div>
                <Pill tone={b.tone}>{b.label}</Pill>
                <p className="mt-3 break-all font-display text-lg font-semibold">{result.domain}</p>
                <p className="text-sm text-muted">{modelLabel} · {totalFailed} interventi aperti</p>
              </div>

              <div className="min-w-0 rounded-xl border border-line bg-surface p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="font-display text-lg font-semibold">Scomposizione per area</h2>
                  <span className="font-mono text-xs text-muted">punteggio · peso nel totale</span>
                </div>
                <ul className="mt-4 grid gap-3.5">
                  {CATEGORIES.map((c) => {
                    const s = categoryScore(c, result.status);
                    const t = TONE[band(s).tone];
                    return (
                      <li key={c.id}>
                        <button type="button" onClick={() => { setOpenCat(c.id); document.getElementById("cat-" + c.id)?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
                          className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5 rounded-md text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent">
                          <span className="truncate text-sm font-medium">{c.name}</span>
                          <span className="font-mono text-sm tabular-nums"><span className={`font-semibold ${t.text}`}>{s}</span><span className="text-muted"> · {c.weights[result.model]}%</span></span>
                          <span className="col-span-2 h-2 overflow-hidden rounded-full bg-track">
                            <span className={`block h-full rounded-full ${t.bar}`} style={{ width: `${s}%`, transition: "width .6s ease" }} />
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <p className="mt-4 text-xs leading-relaxed text-muted">
                  I segnali sono stimati dalla simulazione. Dopo la verifica reale, clicca su OK/KO accanto a ogni controllo per correggerlo: punteggi, quick wins e piano si aggiornano subito.
                </p>
              </div>
            </section>

            {/* QUICK WINS */}
            <section className="rounded-xl border border-line bg-surface p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-display text-lg font-semibold">Quick wins · azioni immediate</h2>
                <span className="text-sm text-muted">Basso sforzo, alto impatto</span>
              </div>
              {wins.length === 0 ? (
                <p className="mt-3 text-sm text-muted">Nessun intervento rapido aperto: passa direttamente agli interventi strutturali del piano.</p>
              ) : (
                <ol className="mt-4 grid gap-3 md:grid-cols-2">
                  {wins.map((k, i) => (
                    <li key={k.id} className="flex gap-3 rounded-lg bg-surface-2 p-4">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent font-mono text-sm font-semibold text-accent-ink">{i + 1}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wider text-accent">{k.cat.short}</p>
                        <p className="mt-0.5 text-sm font-medium leading-snug">{k.fix}</p>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                          <Level label="Impatto" value={k.impact} />
                          <Level label="Sforzo" value={k.effort} />
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </section>

            {/* CATEGORIE */}
            <section className="grid gap-3">
              <h2 className="font-display text-lg font-semibold">Dettaglio per area</h2>
              {[...CATEGORIES].sort((a, b2) => b2.weights[result.model] - a.weights[result.model]).map((c) => (
                <div key={c.id} id={"cat-" + c.id} className="scroll-mt-4">
                  <CategoryCard
                    cat={c} model={result.model} status={result.status} open={openCat === c.id}
                    onToggle={() => setOpenCat(openCat === c.id ? null : c.id)} onFlip={flip}
                  />
                </div>
              ))}
            </section>

            {/* PIANO D'AZIONE */}
            <section className="rounded-xl border border-line bg-surface p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="font-display text-lg font-semibold">Piano d'azione 30-60-90 giorni</h2>
                  <p className="text-sm text-muted">Riepilogo della consulenza da copiare in email, report o documento.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => { setShowPlan((v) => !v); setCopyMsg(""); }}
                    className="h-10 rounded-lg border border-line px-4 text-sm font-semibold hover:bg-surface-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent">
                    {showPlan ? "Nascondi piano" : "Mostra piano"}
                  </button>
                  <button type="button" onClick={() => { setShowPlan(true); copyPlan(); }}
                    className="h-10 rounded-lg bg-accent px-4 text-sm font-semibold text-accent-ink hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
                    Copia piano d'azione
                  </button>
                </div>
              </div>
              {copyMsg && <p className="mt-3 text-sm font-medium text-good" role="status">{copyMsg}</p>}
              {showPlan && (
                <textarea
                  id="plan-text" readOnly value={plan} rows={22}
                  className="mt-4 w-full rounded-lg border border-line bg-bg p-4 font-mono text-xs leading-relaxed text-ink focus:border-accent focus:outline-none"
                />
              )}
            </section>
          </>
        )}

        <footer className="pb-4 text-xs text-muted">
          Simulazione deterministica: lo stesso dominio con lo stesso modello restituisce sempre lo stesso risultato. Per dati reali verifica con PageSpeed Insights, Google Search Console e la scheda Google Business Profile, poi correggi i controlli.
        </footer>
      </main>
    </div>
  );
}
