import { TONE } from "../lib/scoring.js";
import { metricTone, scoreTone, fmtMs, fmtCls } from "../lib/psi.js";

function Tile({ label, value, tone, note }) {
  return (
    <div className="min-w-0 rounded-lg bg-surface-2 p-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</p>
      <p className={`mt-1 font-display text-2xl font-bold tabular-nums ${TONE[tone].text}`}>{value}</p>
      <p className="mt-0.5 text-xs text-muted">{note}</p>
    </div>
  );
}

export default function PsiPanel({ psi }) {
  const inpValue = psi.inp != null ? psi.inp + " ms" : psi.tbt != null ? Math.round(psi.tbt) + " ms" : "n.d.";
  const inpTone = psi.inp != null ? metricTone("inp", psi.inp) : metricTone("tbt", psi.tbt);
  const inpLabel = psi.inp != null ? "INP" : "TBT";
  const inpNote = psi.inp != null ? "reattività · utenti reali" : "blocco script · laboratorio";
  return (
    <section className="rounded-xl border border-line bg-surface p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-lg font-semibold">Dati reali da PageSpeed Insights</h2>
        <span className="font-mono text-xs text-muted">mobile · Lighthouse · Google</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Tile label="Performance" value={psi.perf ?? "n.d."} tone={scoreTone(psi.perf)} note="punteggio 0-100" />
        <Tile label="SEO tecnica" value={psi.seo ?? "n.d."} tone={scoreTone(psi.seo)} note="punteggio 0-100" />
        <Tile label="LCP" value={fmtMs(psi.lcp)} tone={metricTone("lcp", psi.lcp)} note={`contenuto principale · ${psi.lcpSource}`} />
        <Tile label="CLS" value={fmtCls(psi.cls)} tone={metricTone("cls", psi.cls)} note={`stabilità layout · ${psi.clsSource}`} />
        <Tile label={inpLabel} value={inpValue} tone={inpTone} note={inpNote} />
        <Tile label="Best practice" value={psi.bestPractices ?? "n.d."} tone={scoreTone(psi.bestPractices)} note="punteggio 0-100" />
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted">
        Con questi dati sono stati verificati in automatico 6 controlli: title e meta, LCP, reattività, CLS, esperienza mobile e HTTPS. Sono segnati con l'etichetta PSI nel dettaglio per area. I dati "utenti reali" arrivano da Chrome e sono disponibili solo per i siti con traffico sufficiente; altrimenti si usano i test di laboratorio.
      </p>
    </section>
  );
}
