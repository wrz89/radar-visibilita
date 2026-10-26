import { TIME } from "../data/explain.js";

function Est({ id, checked }) {
  return checked[id] ? null : <span className="ml-1.5 rounded bg-surface px-1.5 py-0.5 align-middle font-mono text-[10px] font-semibold text-muted">stima</span>;
}

export default function Summary({ summary, checked, verified, total }) {
  const { headline, problems, strengths, start } = summary;
  return (
    <section className="rounded-xl border border-line bg-surface p-5">
      <h2 className="font-display text-lg font-semibold">In sintesi</h2>
      <p className="mt-2 max-w-3xl text-base leading-relaxed">{headline}</p>
      <p className="mt-1 max-w-3xl text-xs text-muted">Basato su {verified} controlli verificati su {total}: i punti segnati «stima» vanno confermati con la verifica rapida dei canali qui sotto.</p>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="min-w-0 rounded-lg bg-good-soft p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-good">Cosa funziona</h3>
          {strengths.length === 0 ? (
            <p className="mt-2 text-sm text-ink">Nessun controllo importante è ancora a posto: conviene partire dalle basi.</p>
          ) : (
            <ul className="mt-2 grid gap-2 text-sm text-ink">
              {strengths.map((k) => (
                <li key={k.id}>
                  <span className="font-medium">{k.label}</span><Est id={k.id} checked={checked} />
                  <span className="block text-xs text-muted">{k.cat.short}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="min-w-0 rounded-lg bg-bad-soft p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-bad">Cosa non va · i 3 che pesano di più</h3>
          {problems.length === 0 ? (
            <p className="mt-2 text-sm text-ink">Nessun problema aperto.</p>
          ) : (
            <ol className="mt-2 grid list-decimal gap-3 pl-5 text-sm text-ink">
              {problems.map((k) => (
                <li key={k.id}>
                  <span className="font-medium">{k.label}</span><Est id={k.id} checked={checked} />
                  <span className="block text-muted">{k.fail}</span>
                  <span className="mt-1 block text-xs text-muted"><strong className="text-ink">Perché conta:</strong> {k.why}</span>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="min-w-0 rounded-lg bg-accent-soft p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-accent">Da dove partire</h3>
          {start ? (
            <div className="mt-2 text-sm text-ink">
              <p className="font-medium">{start.fix}</p>
              <p className="mt-1 text-xs text-muted">Area: {start.cat.short} · tempo indicativo: {TIME[start.effort]}</p>
              <p className="mt-3 text-muted">Poi segui il piano a 30-60-90 giorni in fondo alla pagina: è ordinato per impatto e sforzo.</p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-ink">Non ci sono interventi aperti: mantieni il livello e ricontrolla tra tre mesi.</p>
          )}
        </div>
      </div>
    </section>
  );
}
