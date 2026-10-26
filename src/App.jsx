import { useState, useEffect, useMemo } from "react";
import { MODELS, CATEGORIES, EXAMPLE, LOADING_STEPS } from "./data/audit.js";
import { TIME } from "./data/explain.js";
import {
  simulate, categoryScore, overallScore, band, quickWins, buildPlan, buildSummary,
  failedChecks, verifiedCount, TOTAL_CHECKS, TONE,
} from "./lib/scoring.js";
import { collectInputs, displayName, seedKey } from "./lib/channels.js";
import { PSI_KEY, fetchPsi } from "./lib/psi.js";
import Gauge from "./components/Gauge.jsx";
import Pill from "./components/Pill.jsx";
import Level from "./components/Level.jsx";
import Priority from "./components/Priority.jsx";
import Summary from "./components/Summary.jsx";
import ChannelsPanel from "./components/ChannelsPanel.jsx";
import CategoryCard from "./components/CategoryCard.jsx";
import LoadingPanel from "./components/LoadingPanel.jsx";
import PsiPanel from "./components/PsiPanel.jsx";

const EMPTY = { name: "", web: "", google: "", facebook: "", instagram: "", linkedin: "", other: "" };

const INPUT_CLS =
  "h-11 w-full rounded-lg border border-line bg-bg px-3 text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-soft disabled:opacity-60";

function Field({ id, label, placeholder, value, onChange, disabled, className = "" }) {
  return (
    <label htmlFor={id} className={`grid gap-1.5 ${className}`}>
      <span className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</span>
      <input id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} disabled={disabled} className={INPUT_CLS} autoComplete="off" />
    </label>
  );
}

const EXAMPLE_INPUT = {
  name: "Officina Rossi",
  web: EXAMPLE.domain,
  channels: [
    { type: "google", label: "Scheda Google", url: "" },
    { type: "facebook", label: "officinarossi", url: "" },
  ],
};

export default function App() {
  const [fields, setFields] = useState(EMPTY);
  const [model, setModel] = useState("b2c");
  const [phase, setPhase] = useState("done");
  const [progress, setProgress] = useState(0);
  const [pending, setPending] = useState(null);
  const [error, setError] = useState("");
  const [result, setResult] = useState(() => ({
    ...EXAMPLE_INPUT,
    display: EXAMPLE_INPUT.name,
    model: EXAMPLE.model,
    status: simulate(EXAMPLE.domain, EXAMPLE.model),
    auto: {},
    manual: {},
    psi: null,
    notice: "",
    isExample: true,
  }));
  const [openCat, setOpenCat] = useState("reputation");
  const [showPlan, setShowPlan] = useState(false);
  const [copyMsg, setCopyMsg] = useState("");

  const setField = (key) => (value) => setFields((f) => ({ ...f, [key]: value }));
  const step = Math.floor((progress / 100) * LOADING_STEPS.length);

  // Analisi reale solo se c'è un sito web e la chiave è configurata.
  const wantsReal = pending ? Boolean(pending.web) : false;
  const realActive = wantsReal && Boolean(PSI_KEY);

  useEffect(() => {
    if (phase !== "loading") return;
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const minTime = reduce ? 600 : 3600;
    const start = Date.now();
    const job = { done: !realActive, data: null, error: null };
    if (realActive) {
      fetchPsi(pending.web)
        .then((d) => { job.data = d; })
        .catch((e) => { job.error = e; })
        .finally(() => { job.done = true; });
    }
    const t = setInterval(() => {
      const el = Date.now() - start;
      if (job.done && el >= minTime) {
        clearInterval(t);
        setProgress(100);
        const status = simulate(seedKey(pending), pending.model);
        const auto = {};
        let psi = null;
        let notice = "";
        if (job.data) {
          psi = job.data;
          Object.entries(job.data.checks).forEach(([id, ok]) => { status[id] = ok; auto[id] = true; });
        } else if (job.error) {
          notice = job.error.message + " Il risultato mostrato è una stima.";
        } else if (wantsReal && !PSI_KEY) {
          notice = "Chiave PageSpeed non configurata in questa versione: il risultato mostrato è una stima.";
        } else if (!wantsReal) {
          notice = "Senza il sito web non posso misurare velocità e SEO tecnica: quei controlli restano stimati. Usa la verifica rapida dei canali per confermare gli altri.";
        }
        setResult({ ...pending, display: displayName(pending), status, auto, manual: {}, psi, notice, isExample: false });
        const weakest = [...CATEGORIES].sort((a, b) => categoryScore(a, status) - categoryScore(b, status))[0];
        setOpenCat(weakest.id);
        setShowPlan(false);
        setPhase("done");
        return;
      }
      const p = job.done
        ? Math.min(100, (el / minTime) * 100)
        : realActive
          ? Math.min(92, 92 * (1 - Math.exp(-el / 14000)))
          : Math.min(100, (el / minTime) * 100);
      setProgress((prev) => Math.max(prev, p));
    }, 100);
    return () => clearInterval(t);
  }, [phase, pending]);

  function analyze(e) {
    e.preventDefault();
    const parsed = collectInputs(fields);
    if (parsed.error) {
      setError(parsed.error);
      return;
    }
    setError("");
    setPending({ ...parsed, model });
    setProgress(0);
    setPhase("loading");
  }

  // Imposta il valore di un controllo dopo una verifica manuale (modulo canali o bottone OK/KO).
  function setCheck(id, value) {
    setResult((r) => ({
      ...r,
      status: { ...r.status, [id]: value },
      manual: { ...r.manual, [id]: true },
      auto: { ...r.auto, [id]: false },
    }));
  }
  const flip = (id) => setCheck(id, !result.status[id]);

  const score = useMemo(() => overallScore(result.model, result.status), [result]);
  const b = band(score);
  const wins = useMemo(() => quickWins(result.status, result.model), [result]);
  const summary = useMemo(() => buildSummary(result), [result]);
  const plan = useMemo(() => buildPlan(result), [result]);
  const modelLabel = MODELS.find((m) => m.id === result.model).label;
  const totalFailed = failedChecks(result.status, result.model).length;
  const verified = verifiedCount(result);
  const checkedIds = useMemo(() => {
    const o = {};
    Object.keys(result.status).forEach((id) => { o[id] = Boolean((result.auto && result.auto[id]) || (result.manual && result.manual[id])); });
    return o;
  }, [result]);

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

  const busy = phase === "loading";

  return (
    <div className="min-h-full bg-bg font-sans text-ink">
      <header className="border-b border-line bg-surface">
        <div className="wrap mx-auto flex max-w-6xl items-center gap-3 py-3">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-accent-ink" aria-hidden="true">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /><path d="M12 12l6-6" /></svg>
          </span>
          <span className="font-display text-base font-bold tracking-tight">Radar Visibilità</span>
          <span className="ml-auto hidden font-mono text-xs text-muted sm:block">Audit di consulenza digitale · 5 aree · {TOTAL_CHECKS} controlli</span>
        </div>
      </header>

      <main className="wrap mx-auto grid max-w-6xl gap-6 py-6 sm:py-8">
        {/* INPUT */}
        <form onSubmit={analyze} className="rounded-xl border border-line bg-surface p-4 sm:p-6">
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl" style={{ textWrap: "balance" }}>Audit di visibilità online</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">Inserisci quello che hai: basta anche un solo campo. Più canali aggiungi, più completa è l'analisi.</p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field id="name" label="Nome azienda" placeholder="es. Gomme Rossi Srl" value={fields.name} onChange={setField("name")} disabled={busy} />
            <Field id="web" label="Sito web" placeholder="es. gommerossi.it (misurato da Google)" value={fields.web} onChange={setField("web")} disabled={busy} />
          </div>

          <fieldset className="mt-4 rounded-lg border border-line p-4">
            <legend className="px-1 text-xs font-semibold uppercase tracking-wider text-muted">Altri canali · facoltativi</legend>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field id="google" label="Scheda Google" placeholder="link di Google Maps" value={fields.google} onChange={setField("google")} disabled={busy} />
              <Field id="facebook" label="Facebook" placeholder="link della pagina" value={fields.facebook} onChange={setField("facebook")} disabled={busy} />
              <Field id="instagram" label="Instagram" placeholder="link del profilo" value={fields.instagram} onChange={setField("instagram")} disabled={busy} />
              <Field id="linkedin" label="LinkedIn" placeholder="link della pagina" value={fields.linkedin} onChange={setField("linkedin")} disabled={busy} />
            </div>
            <Field id="other" label="Altri link (TikTok, YouTube, altri siti)" placeholder="incolla uno o più link, separati da spazio" value={fields.other} onChange={setField("other")} disabled={busy} className="mt-4" />
            <p className="mt-3 text-xs text-muted">Se incolli un link nel campo sbagliato lo riconosco da solo e lo metto al posto giusto.</p>
          </fieldset>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
            <fieldset className="grid gap-1.5">
              <legend className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted">Modello di business</legend>
              <div className="grid grid-cols-2 gap-1 rounded-lg bg-surface-2 p-1 sm:grid-cols-4">
                {MODELS.map((m) => (
                  <button
                    key={m.id} type="button" onClick={() => setModel(m.id)} title={m.hint} aria-pressed={model === m.id}
                    disabled={busy}
                    className={`h-9 rounded-md px-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${model === m.id ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"}`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </fieldset>
            <button
              type="submit" disabled={busy}
              className="h-11 rounded-lg bg-accent px-6 font-semibold text-accent-ink transition-opacity hover:opacity-90 disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {busy ? "Analisi in corso…" : "Analizza Visibilità"}
            </button>
          </div>
          {error && <p className="mt-3 text-sm font-medium text-bad" role="alert">{error}</p>}
        </form>

        {busy && pending && <LoadingPanel domain={displayName(pending)} progress={progress} step={step} real={realActive} />}

        {phase === "done" && (
          <>
            {result.isExample && (
              <p className="rounded-lg border border-line bg-surface-2 px-4 py-3 text-sm text-muted">
                <strong className="text-ink">Esempio dimostrativo</strong> su un'officina locale fittizia. Compila il modulo sopra per avviare la tua analisi.
              </p>
            )}
            {result.notice && (
              <p className="rounded-lg border border-line bg-warn-soft px-4 py-3 text-sm text-warn" role="status">{result.notice}</p>
            )}

            {/* PUNTEGGIO */}
            <section className="grid gap-4 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
              <div className="flex flex-col items-center rounded-xl border border-line bg-surface p-5 text-center">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">Punteggio globale</p>
                <div className="my-2"><Gauge score={score} /></div>
                <Pill tone={b.tone}>{b.label}</Pill>
                <p className="mt-2 text-sm text-muted">{b.globalDesc}</p>
                <p className="mt-3 break-words font-display text-lg font-semibold">{result.display}</p>
                <p className="text-sm text-muted">{modelLabel} · {totalFailed} interventi aperti</p>
                <p className="mt-2 font-mono text-xs text-muted">{verified} di {TOTAL_CHECKS} controlli verificati · {TOTAL_CHECKS - verified} stimati</p>
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
                  I controlli con etichetta PSI sono misurati da Google, quelli «Verificato» li hai confermati tu, gli altri sono stimati. Correggili con la verifica rapida dei canali o con i bottoni OK/KO: punteggi, quick wins e piano si aggiornano subito.
                </p>
              </div>
            </section>

            <Summary summary={summary} checked={checkedIds} verified={verified} total={TOTAL_CHECKS} />

            {result.psi && <PsiPanel psi={result.psi} />}

            <ChannelsPanel result={result} onSet={setCheck} />

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
                        <p className="mt-1.5 text-xs leading-relaxed text-muted"><strong className="text-ink">Perché:</strong> {k.why}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                          <Priority k={k} />
                          <Level label="Impatto" value={k.impact} />
                          <Level label="Sforzo" value={k.effort} />
                        </div>
                        <p className="mt-1.5 text-xs text-muted">Tempo indicativo: {TIME[k.effort]}</p>
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
                    cat={c} model={result.model} status={result.status} auto={result.auto} manual={result.manual} psi={result.psi}
                    open={openCat === c.id}
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
                  <p className="text-sm text-muted">Riepilogo della consulenza con motivazioni e passi concreti, da copiare in email, report o documento.</p>
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
                  id="plan-text" readOnly value={plan} rows={26}
                  className="mt-4 w-full rounded-lg border border-line bg-bg p-4 font-mono text-xs leading-relaxed text-ink focus:border-accent focus:outline-none"
                />
              )}
            </section>
          </>
        )}

        <footer className="pb-4 text-xs text-muted">
          Performance, Core Web Vitals, HTTPS, esperienza mobile e title/meta sono letti da Google PageSpeed Insights quando si inserisce un sito web. Scheda Google e profili social non si possono leggere in automatico: si verificano con le domande guidate. I controlli non verificati sono stimati in modo deterministico (stessi dati e modello, stesso risultato).
        </footer>
      </main>
    </div>
  );
}
