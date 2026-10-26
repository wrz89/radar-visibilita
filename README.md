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

## Importante: analisi simulata

La versione attuale **non legge il sito reale**: lo stato iniziale dei controlli è generato in modo deterministico dal dominio e dal modello (stesso input, stesso risultato). Dopo una verifica manuale, ogni controllo si corregge con il bottone OK/KO e punteggi, quick wins e piano si aggiornano subito.

Strumenti utili per la verifica: PageSpeed Insights, Google Search Console, scheda Google Business Profile, profili social del cliente.

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
  components/            Gauge, Pill, Level, CategoryCard, LoadingPanel
  App.jsx                interfaccia principale
  index.css              token colore (tema chiaro e scuro) e stili base
```

Per modificare controlli, pesi o consigli basta intervenire su `src/data/audit.js`.

## Evoluzioni possibili

1. Integrazione reale con l'API di PageSpeed Insights per i Core Web Vitals (richiede una funzione lato server per la chiave API).
2. Lettura di title, meta, H1 e dati strutturati della home tramite una funzione lato server.
3. Salvataggio degli audit (es. Supabase) per confrontare i punteggi nel tempo.
4. Export del piano in PDF.
