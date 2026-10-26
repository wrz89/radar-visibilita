import { LOADING_STEPS } from "../data/audit.js";

export default function LoadingPanel({ domain, progress, step }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-6 sm:p-8" aria-live="polite">
      <div className="flex items-center gap-3">
        <span className="radar relative h-10 w-10 shrink-0 rounded-full border-2 border-accent" aria-hidden="true" />
        <div className="min-w-0">
          <p className="font-display text-lg font-semibold text-ink">Analisi di {domain}</p>
          <p className="text-sm text-muted">{LOADING_STEPS[Math.min(step, LOADING_STEPS.length - 1)]}…</p>
        </div>
        <span className="ml-auto font-mono text-sm tabular-nums text-muted">{Math.round(progress)}%</span>
      </div>
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-track">
        <div className="h-full rounded-full bg-accent transition-[width] duration-200" style={{ width: `${progress}%` }} />
      </div>
      <ol className="mt-5 grid gap-2 sm:grid-cols-2">
        {LOADING_STEPS.map((s, i) => (
          <li key={s} className={`flex items-center gap-2 text-sm ${i < step ? "text-ink" : i === step ? "text-accent" : "text-muted"}`}>
            <span className={`h-2 w-2 rounded-full ${i < step ? "bg-good" : i === step ? "bg-accent" : "bg-track"}`} />
            {s}
          </li>
        ))}
      </ol>
    </div>
  );
}
