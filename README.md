# Radar Visibilità

Tool di audit e consulenza della visibilità online per qualsiasi azienda o sito web. Valuta 5 aree con 32 controlli, calcola un punteggio globale ponderato in base al modello di business e genera quick wins e un piano d'azione a 30-60-90 giorni.

## Aree analizzate

| Area | Cosa controlla |
|---|---|
| SEO & Posizionamento Organico | title e meta, struttura H1, parole chiave, pagine servizio, backlink, dati strutturati, Search Console |
| Inbound & Content Marketing | blog, lead magnet, form, email nurturing, funnel, tracciamento conversioni GA4 |
| Social Media & Brand Awareness | profili, frequenza, tone of voice, engagement, video brevi, collegamenti sito-social |
| Reputazione & Social Proof | Google Business Profile, recensioni, risposte, casi studio, trust signal, processo di raccolta |
| UX, Performance & Tech SEO | Core Web Vitals (LCP, INP, CLS), mobile, CTA, navigazione, HTTPS |

## Pesi per modello di business

| Area | Attività locale | B2C | B2B | E-commerce |
|---|---:|---:|---:|---:|
| SEO | 20% | 22% | 22% | 25% |
| Contenuti | 10% | 18% | 30% | 15% |
| Social | 15% | 22% | 12% | 15% |
| Reputazione | 35% | 18% | 18% | 15% |
| UX & Tech | 20% | 20% | 18% | 30% |

## Come funziona il punteggio

- Ogni controllo ha un **impatto** (1-3) e uno **sforzo** (1-3).
- Punteggio di area = somma degli impatti dei controlli superati / impatto totale dell'area.
- Punteggio globale = media ponderata delle aree secondo il modello di business.
- Fasce: 75+ Solido, 50-74 Da rafforzare, sotto 50 Critico.
- **Quick wins**: controlli non superati con sforzo basso e impatto medio-alto.

## Dati reali e parti simulate

Inserendo un **dominio** (es. `gommistaverdi.it`) il tool interroga l'API gratuita **PageSpeed Insights** (mobile) e verifica in automatico 6 controlli, segnati con l'etichetta **PSI**:

| Controllo | Fonte |
|---|---|
| LCP sotto 2,5 s | dati utenti reali Chrome, altrimenti laboratorio |
| Reattività (INP sotto 200 ms) | INP reale, altrimenti Total Blocking Time di laboratorio |
| CLS sotto 0,1 | dati utenti reali, altrimenti laboratorio |
| Esperienza mobile | audit Lighthouse viewport, dimensione font, aree di tocco |
| HTTPS | audit Lighthouse |
| Title e meta description | audit Lighthouse |

Vengono mostrati anche i punteggi Performance, SEO tecnica e Best practice.

Tutti gli altri controlli (reputazione, social, contenuti, backlink, ecc.) sono **stimati in modo deterministico** dal dominio e dal modello (stesso input, stesso risultato). Vanno verificati a mano e corretti con il bottone OK/KO: punteggi, quick wins e piano si aggiornano subito. Se Google non risponde, o si inserisce un nome azienda invece di un dominio, il tool ripiega sulla simulazione e lo segnala con un avviso.

## Configurare la chiave PageSpeed

1. Console Google Cloud: abilita **PageSpeed Insights API** e crea una **chiave API**.
2. Limita la chiave: restrizione applicazione **Referrer HTTP** (`https://wrz89.github.io/*`, `http://localhost:5173/*`) e restrizione API alla sola PageSpeed Insights API.
3. In locale: copia `.env.example` in `.env` e inserisci la chiave (il file è ignorato da git).
4. Su GitHub: *Settings → Secrets and variables → Actions → New repository secret*, nome `PSI_API_KEY`. Il workflow la passa alla build come `VITE_PSI_API_KEY`.

La chiave finisce comunque nel codice JavaScript del sito pubblico: la protezione sono le restrizioni al punto 2, non la segretezza.

## Avvio in locale

Serve Node.js 18 o superiore.

```bash
npm install
npm run dev
```

Build di produzione:

```bash
npm run build
npm run preview
```

## Pubblicazione

Ogni push su `main` esegue il workflow `.github/workflows/deploy.yml` e pubblica il sito su GitHub Pages.

## Struttura

```
src/
  data/audit.js          modelli, aree, controlli, consigli strategici
  lib/scoring.js         simulazione, punteggi, quick wins, piano d'azione
  lib/psi.js             chiamata a PageSpeed Insights e mappatura sui controlli
  components/            Gauge, Pill, Level, CategoryCard, LoadingPanel, PsiPanel
  App.jsx                interfaccia principale
  index.css              token colore (tema chiaro e scuro) e stili base
```

Per modificare controlli, pesi o consigli basta intervenire su `src/data/audit.js`.

## Evoluzioni possibili

1. Lettura di H1, dati strutturati, sitemap e link della home tramite una funzione lato server (il browser non può leggere siti di altri domini).
2. Salvataggio degli audit (es. Supabase) per confrontare i punteggi nel tempo.
3. Export del piano in PDF.
