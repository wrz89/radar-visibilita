// Modelli di business, aree di audit, controlli e consigli strategici.
import { EXPLAIN } from "./explain.js";

export const MODELS = [
  { id: "local", label: "Attività locale", hint: "officine, negozi, studi" },
  { id: "b2c", label: "B2C", hint: "servizi al consumatore" },
  { id: "b2b", label: "B2B", hint: "vendita ad aziende" },
  { id: "ecom", label: "E-commerce", hint: "vendita online" },
];

// impact: 1 basso · 2 medio · 3 alto  |  effort: 1 basso · 2 medio · 3 alto
export const CATEGORIES = [
  {
    id: "seo",
    name: "SEO & Posizionamento Organico",
    short: "SEO",
    weights: { local: 20, b2c: 22, b2b: 22, ecom: 25 },
    advice: {
      local: "Punta sulle ricerche “servizio + città”. Una pagina per ogni servizio principale e per ogni zona servita vale più di qualsiasi articolo generico. Collega ogni pagina alla scheda Google.",
      b2c: "Costruisci cluster tematici: una pagina pilastro per ogni bisogno del cliente e 4-6 contenuti di supporto collegati. Lavora sulle ricerche informative che precedono l'acquisto.",
      b2b: "Mappa le parole chiave per ruolo decisionale (tecnico, acquisti, direzione) e per problema risolto. Le pagine soluzione per settore convertono più delle pagine prodotto generiche.",
      ecom: "La SEO si gioca sulle pagine categoria: testi introduttivi unici, filtri indicizzabili solo dove c'è domanda di ricerca, dati strutturati Product con prezzo e disponibilità.",
    },
    checks: [
      { id: "seo1", label: "Title e meta description unici per pagina", fail: "Title duplicati o generici: Google sceglie da solo cosa mostrare e il CTR cala.", fix: "Riscrivere title (max 60 caratteri) e meta description (max 155) delle 10 pagine principali con servizio + località/beneficio.", impact: 3, effort: 1 },
      { id: "seo2", label: "Un solo H1 per pagina con la parola chiave principale", fail: "Struttura dei titoli confusa: più H1 o H1 senza parola chiave.", fix: "Impostare un H1 unico e descrittivo per ogni pagina, H2 per le sezioni.", impact: 2, effort: 1 },
      { id: "seo3", label: "Ricerca parole chiave mappata sulle pagine", fail: "Nessuna corrispondenza tra ricerche reali degli utenti e pagine del sito.", fix: "Costruire una mappa 1 parola chiave principale → 1 pagina, partendo da 20-30 ricerche prioritarie.", impact: 3, effort: 2 },
      { id: "seo4", label: "Pagine dedicate per ogni servizio o categoria", fail: "Servizi raggruppati in un'unica pagina: impossibile posizionarsi su ricerche specifiche.", fix: "Creare una pagina per ogni servizio o categoria principale, con testo originale e CTA.", impact: 3, effort: 2 },
      { id: "seo5", label: "Backlink da siti locali e di settore", fail: "Profilo link debole: pochi siti autorevoli citano l'azienda.", fix: "Ottenere link da associazioni di categoria, fornitori, partner, testate locali e directory di qualità.", impact: 2, effort: 3 },
      { id: "seo6", label: "Dati strutturati schema.org", fail: "Mancano dati strutturati: niente stelle, orari o prezzi nei risultati di ricerca.", fix: "Aggiungere markup LocalBusiness/Organization, FAQ e, se e-commerce, Product.", impact: 2, effort: 1 },
      { id: "seo7", label: "Sitemap inviata e Search Console attiva", fail: "Indicizzazione non monitorata: errori e pagine escluse restano invisibili.", fix: "Verificare il dominio in Google Search Console e inviare la sitemap XML.", impact: 3, effort: 1 },
    ],
  },
  {
    id: "content",
    name: "Inbound & Content Marketing",
    short: "Contenuti",
    weights: { local: 10, b2c: 18, b2b: 30, ecom: 15 },
    advice: {
      local: "Non serve un blog quotidiano. Servono 5-6 contenuti utili che rispondono alle domande che i clienti fanno al banco, più un modo semplice per chiedere un preventivo o prenotare.",
      b2c: "Crea un lead magnet legato al momento d'acquisto (guida, checklist, sconto sul primo ordine) e una sequenza email di 3-4 messaggi per chi lo scarica.",
      b2b: "Il ciclo di vendita è lungo: servono contenuti per ogni fase. Guide tecniche per chi si informa, casi studio e calcolatori ROI per chi valuta, e un nurturing email che passi i lead caldi al commerciale.",
      ecom: "Usa i contenuti per sbloccare l'acquisto: guide alla scelta, confronti, FAQ di prodotto. Recupero carrelli e email post-acquisto sono il funnel con il ritorno più alto.",
    },
    checks: [
      { id: "ct1", label: "Blog o sezione contenuti aggiornata (almeno 2 al mese)", fail: "Contenuti fermi da mesi: il sito non intercetta ricerche informative.", fix: "Pianificare un calendario editoriale di 2 contenuti al mese sulle domande frequenti dei clienti.", impact: 2, effort: 2 },
      { id: "ct2", label: "Lead magnet (guida, checklist, preventivo rapido)", fail: "Nessun motivo per lasciare un contatto a chi non è ancora pronto a comprare.", fix: "Creare un lead magnet concreto (es. checklist, guida PDF, preventivo in 2 minuti) e promuoverlo nelle pagine chiave.", impact: 3, effort: 2 },
      { id: "ct3", label: "Form di contatto breve e visibile", fail: "Form lungo o nascosto: si perdono richieste già pronte.", fix: "Ridurre il form a 3-4 campi e inserirlo in ogni pagina servizio.", impact: 3, effort: 1 },
      { id: "ct4", label: "Email marketing o nurturing attivo", fail: "I contatti raccolti non ricevono comunicazioni: valore perso.", fix: "Attivare una sequenza automatica di benvenuto (3-4 email) e una newsletter mensile.", impact: 2, effort: 2 },
      { id: "ct5", label: "Contenuti per ogni fase del funnel", fail: "Contenuti solo promozionali: nulla per chi si sta ancora informando o confrontando.", fix: "Mappare contenuti per consapevolezza, valutazione e decisione; colmare la fase più scoperta.", impact: 2, effort: 3 },
      { id: "ct6", label: "Conversioni tracciate in GA4", fail: "Non si sa quali canali generano contatti: impossibile decidere dove investire.", fix: "Configurare in GA4 gli eventi chiave (invio form, clic su telefono e WhatsApp, acquisto).", impact: 3, effort: 1 },
    ],
  },
  {
    id: "social",
    name: "Social Media & Brand Awareness",
    short: "Social",
    weights: { local: 15, b2c: 22, b2b: 12, ecom: 15 },
    advice: {
      local: "Due canali curati bastano (di solito Facebook e Instagram). Mostra lavori reali, il team e le offerte stagionali; rispondi ai messaggi entro poche ore, perché spesso sono richieste di preventivo.",
      b2c: "Definisci 3-4 rubriche ricorrenti e un tone of voice scritto. Il video breve è il formato con più copertura organica: pianificane almeno uno a settimana.",
      b2b: "LinkedIn è il canale principale: pagina aziendale attiva, ma soprattutto i profili personali di titolare e commerciali. Condividi casi, numeri e punti di vista sul settore.",
      ecom: "Usa i social per prova sociale e scoperta: contenuti dei clienti, catalogo collegato a Instagram e Facebook. Misura il traffico verso il sito, non solo i like.",
    },
    checks: [
      { id: "so1", label: "Profili completi e coerenti (logo, bio, link, orari)", fail: "Profili incompleti o con dati diversi dal sito: immagine poco curata.", fix: "Uniformare logo, descrizione, contatti e link su tutti i profili.", impact: 2, effort: 1 },
      { id: "so2", label: "Pubblicazione regolare (almeno 2 post a settimana)", fail: "Pubblicazioni sporadiche: l'algoritmo riduce la copertura.", fix: "Preparare un piano mensile con rubriche fisse e programmare i post in anticipo.", impact: 2, effort: 2 },
      { id: "so3", label: "Tone of voice definito", fail: "Stile comunicativo diverso da post a post: il brand non è riconoscibile.", fix: "Scrivere una pagina di linee guida: tono, parole da usare ed evitare, esempi.", impact: 1, effort: 2 },
      { id: "so4", label: "Risposte a commenti e messaggi entro 24 ore", fail: "Messaggi senza risposta: richieste commerciali perse.", fix: "Attivare risposte rapide e assegnare un responsabile al controllo giornaliero.", impact: 2, effort: 1 },
      { id: "so5", label: "Video brevi (Reels, Shorts, TikTok)", fail: "Nessun video breve: si rinuncia al formato con più copertura organica.", fix: "Girare 1 video breve a settimana con lo smartphone: lavori, consigli, dietro le quinte.", impact: 2, effort: 2 },
      { id: "so6", label: "Collegamenti tra social e sito", fail: "Sito e social non si richiamano a vicenda.", fix: "Inserire icone social nel sito e link al sito o a WhatsApp nelle bio.", impact: 1, effort: 1 },
    ],
  },
  {
    id: "reputation",
    name: "Reputazione & Social Proof",
    short: "Reputazione",
    weights: { local: 35, b2c: 18, b2b: 18, ecom: 15 },
    advice: {
      local: "È l'area che pesa di più per un'attività locale: chi cerca “vicino a me” sceglie tra le prime schede Google in base a stelle e numero di recensioni. Chiedi la recensione a ogni cliente soddisfatto, con QR al banco e messaggio dopo il servizio.",
      b2c: "Rendi visibili le recensioni dove si decide: home, pagine servizio, checkout. Rispondi a tutte, anche alle negative, in modo pubblico e concreto.",
      b2b: "La fiducia passa da casi studio con nomi e numeri, loghi clienti, certificazioni e referenze. Prepara 3 casi studio strutturati: problema, soluzione, risultato misurato.",
      ecom: "Le recensioni prodotto aumentano la conversione: raccoglile in automatico dopo la consegna, mostra il rating nelle schede e nei risultati Google, evidenzia resi e garanzie.",
    },
    checks: [
      { id: "re1", label: "Google Business Profile verificato e completo", fail: "Scheda Google incompleta: foto, categorie, servizi o orari mancanti.", fix: "Completare la scheda: categorie, servizi, 15+ foto reali, orari, link prenotazione; pubblicare un post a settimana.", impact: 3, effort: 1 },
      { id: "re2", label: "Valutazione ≥ 4,3 con oltre 50 recensioni", fail: "Volume o media recensioni sotto i concorrenti diretti.", fix: "Avviare una campagna di raccolta recensioni sui clienti degli ultimi 6 mesi.", impact: 3, effort: 2 },
      { id: "re3", label: "Risposta a tutte le recensioni", fail: "Recensioni senza risposta, comprese quelle negative.", fix: "Rispondere entro 48 ore a ogni recensione con un testo personalizzato.", impact: 2, effort: 1 },
      { id: "re4", label: "Casi studio o testimonianze sul sito", fail: "Il sito non mostra risultati concreti ottenuti per clienti reali.", fix: "Pubblicare 3 casi o testimonianze con nome, foto e risultato.", impact: 2, effort: 2 },
      { id: "re5", label: "Trust signal visibili (certificazioni, garanzie, partner)", fail: "Mancano elementi che rassicurano prima del contatto.", fix: "Mostrare in home certificazioni, marchi partner, garanzie e dati aziendali completi.", impact: 2, effort: 1 },
      { id: "re6", label: "Processo sistematico di richiesta recensioni", fail: "Le recensioni arrivano per caso, non da un processo.", fix: "Inviare a ogni cliente, dopo il servizio, un messaggio con link diretto alla recensione; QR code al banco.", impact: 3, effort: 1 },
    ],
  },
  {
    id: "ux",
    name: "UX, Performance & Tech SEO",
    short: "UX & Tech",
    weights: { local: 20, b2c: 20, b2b: 18, ecom: 30 },
    advice: {
      local: "La maggior parte del traffico arriva da smartphone: numero cliccabile, pulsante WhatsApp e “Prenota” sempre visibili. Velocità e chiarezza contano più della grafica.",
      b2c: "Ogni pagina deve avere un'azione principale chiara. Riduci i campi dei form e togli script e plugin che rallentano il caricamento da mobile.",
      b2b: "Il visitatore deve capire in 5 secondi cosa fate, per chi e cosa fare dopo. Navigazione per soluzione o settore, CTA “Richiedi una consulenza” in ogni pagina.",
      ecom: "Performance e checkout sono fatturato diretto: immagini ottimizzate, checkout in pochi passi, pagamenti rapidi e costi di spedizione chiari prima del carrello.",
    },
    checks: [
      { id: "ux1", label: "LCP sotto 2,5 s (caricamento contenuto principale)", fail: "Il contenuto principale appare lentamente: utenti persi prima di leggere.", fix: "Comprimere le immagini (WebP), attivare cache e lazy loading, ridurre i plugin.", impact: 3, effort: 2 },
      { id: "ux2", label: "INP sotto 200 ms (reattività ai clic)", fail: "Il sito risponde in ritardo a clic e tocchi.", fix: "Ridurre o rinviare JavaScript di terze parti (chat, pixel, slider).", impact: 2, effort: 2 },
      { id: "ux3", label: "CLS sotto 0,1 (stabilità del layout)", fail: "Elementi che si spostano durante il caricamento: clic sbagliati.", fix: "Definire dimensioni fisse per immagini, banner e box cookie.", impact: 1, effort: 1 },
      { id: "ux4", label: "Esperienza mobile ottimizzata", fail: "Testi piccoli, pulsanti ravvicinati o contenuti tagliati su smartphone.", fix: "Revisionare le 5 pagine più visitate da mobile: font, pulsanti, menu, form.", impact: 3, effort: 2 },
      { id: "ux5", label: "CTA principale visibile senza scorrere", fail: "L'azione principale non si vede appena si apre la pagina.", fix: "Inserire nella parte alta di ogni pagina una CTA chiara (Chiama, WhatsApp, Prenota, Acquista).", impact: 3, effort: 1 },
      { id: "ux6", label: "Menu chiaro, massimo 7 voci", fail: "Navigazione dispersiva: troppe voci o etichette poco chiare.", fix: "Ridurre il menu alle voci essenziali con etichette nel linguaggio del cliente.", impact: 1, effort: 1 },
      { id: "ux7", label: "HTTPS attivo senza contenuti misti", fail: "Avvisi di sicurezza del browser o risorse caricate in HTTP.", fix: "Forzare HTTPS con redirect 301 e correggere le risorse non sicure.", impact: 2, effort: 1 },
    ],
  },
];

export const LOADING_STEPS = [
  "Lettura meta tag e struttura dei titoli",
  "Stima dei Core Web Vitals da mobile",
  "Mappatura dei profili social",
  "Raccolta dei segnali di reputazione",
  "Valutazione di contenuti e funnel",
  "Calcolo dei punteggi ponderati",
];

export const EXAMPLE = { domain: "officinarossi.it", model: "local" };

// Aggiunge a ogni controllo "why" (perché conta) e "how" (passi per risolverlo).
CATEGORIES.forEach((c) => c.checks.forEach((k) => Object.assign(k, EXPLAIN[k.id])));
