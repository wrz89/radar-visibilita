import { TYPE_LABEL } from "../lib/channels.js";

function Row({ label, ok, children }) {
  const mark = ok === true ? { t: "✓", c: "text-good" } : ok === false ? { t: "✗", c: "text-bad" } : { t: "·", c: "text-muted" };
  return (
    <li className="grid grid-cols-[1.25rem_minmax(0,1fr)] gap-x-2 py-2">
      <span className={`font-mono font-bold ${mark.c}`} aria-hidden="true">{mark.t}</span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</p>
        <p className="mt-0.5 break-words text-sm">{children}</p>
      </div>
    </li>
  );
}

export default function ScanPanel({ scan }) {
  const s = scan;
  const analytics = [s.analytics.ga4 && "Google Analytics 4", s.analytics.gtm && "Google Tag Manager", s.analytics.ua && "Universal Analytics (obsoleto)", s.analytics.metaPixel && "Meta Pixel"].filter(Boolean);
  const contacts = [s.contacts.tel && "telefono cliccabile", s.contacts.whatsapp && "WhatsApp", s.contacts.email && "email"].filter(Boolean);
  return (
    <section className="rounded-xl border border-line bg-surface p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-lg font-semibold">Cosa ho letto sul sito</h2>
        <span className="font-mono text-xs text-muted">home page · lettura automatica</span>
      </div>

      {s.jsRendered && (
        <p className="mt-3 rounded-lg bg-warn-soft px-3 py-2 text-sm text-warn">
          Il sito carica i contenuti con JavaScript: dall'HTML riesco a leggere poco, quindi i controlli sul contenuto restano stimati.
        </p>
      )}

      <ul className="mt-3 grid gap-x-8 divide-y divide-line md:grid-cols-2 md:divide-y-0">
        <div className="divide-y divide-line">
          <Row label="Title" ok={s.title ? true : false}>{s.title || "Assente"}</Row>
          <Row label="Meta description" ok={s.metaDescription ? true : false}>{s.metaDescription || "Assente"}</Row>
          <Row label="Titolo principale (H1)" ok={s.jsRendered ? null : s.h1.count === 1}>
            {s.h1.count === 0 ? "Nessun H1" : `${s.h1.count} H1${s.h1.first ? `: «${s.h1.first.slice(0, 90)}»` : ""}`}
          </Row>
          <Row label="Dati strutturati" ok={s.jsRendered ? null : s.schemaTypes.length > 0}>
            {s.schemaTypes.length ? s.schemaTypes.slice(0, 6).join(", ") : "Nessuno utile"}
          </Row>
          <Row label="Sitemap" ok={s.sitemap.found}>{s.sitemap.found ? s.sitemap.url || "Dichiarata in robots.txt" : "Non trovata"}</Row>
        </div>
        <div className="divide-y divide-line">
          <Row label="Social collegati dal sito" ok={s.jsRendered ? null : s.socials.length > 0}>
            {s.socials.length ? s.socials.map((x) => `${TYPE_LABEL[x.type]} (${x.label})`).join(" · ") : "Nessun link ai profili social"}
          </Row>
          <Row label="Contatti rapidi" ok={s.jsRendered ? null : contacts.length > 0 || s.ctaFound}>
            {contacts.length ? contacts.join(", ") : s.ctaFound ? "Solo pulsanti di contatto" : "Nessun telefono cliccabile, WhatsApp o pulsante"}
          </Row>
          <Row label="Modulo di contatto" ok={s.forms.minFields === null ? null : s.forms.minFields <= 5}>
            {s.forms.minFields === null ? "Nessun modulo nella home" : `${s.forms.minFields} campi`}
          </Row>
          <Row label="Statistiche e tracciamento" ok={s.jsRendered ? null : analytics.length > 0}>
            {analytics.length ? analytics.join(", ") : "Nessun tag trovato"}
          </Row>
          <Row label="Blog o notizie" ok={null}>{s.blogLink ? "Sezione presente nel menu" : "Non trovata nella home"}</Row>
        </div>
      </ul>
      <p className="mt-3 text-xs leading-relaxed text-muted">
        Letti dall'HTML della sola home. Se un'informazione non c'è qui può comunque esistere in un'altra pagina: i controlli collegati diventano KO solo quando l'assenza è certa. I profili social trovati compaiono tra i canali da verificare.
      </p>
    </section>
  );
}
