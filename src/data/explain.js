// Spiegazioni per ogni controllo: perché conta per il business e come risolverlo, in passi concreti.

export const TIME = {
  1: "meno di mezza giornata",
  2: "1-2 settimane",
  3: "1-3 mesi",
};

export const EXPLAIN = {
  seo1: {
    why: "Title e meta description sono ciò che si legge nei risultati di Google: decidono se il cliente clicca su di voi o sul concorrente.",
    how: [
      "Elenca le 10 pagine più importanti (home, servizi principali, contatti).",
      "Scrivi per ognuna un title di massimo 60 caratteri con servizio e città o beneficio (es. «Cambio gomme a Monza | Nome Officina»).",
      "Aggiungi una meta description di massimo 155 caratteri che chiude con un invito all'azione e controlla che nessuna pagina ripeta quella di un'altra.",
    ],
  },
  seo2: {
    why: "L'H1 dice a Google e al visitatore di cosa parla la pagina. Se manca o è doppio, la pagina fatica a comparire per la ricerca giusta.",
    how: [
      "Apri ogni pagina principale e conta gli H1: deve essercene uno solo.",
      "Inserisci nell'H1 il servizio e, se l'attività è locale, la zona (es. «Gommista a Lodi: cambio e deposito gomme»).",
      "Usa gli H2 per le sezioni interne, senza ripetere l'H1.",
    ],
  },
  seo3: {
    why: "Se non sai cosa cercano davvero i clienti, scrivi pagine su cose che nessuno digita e non compari per le ricerche che portano contatti.",
    how: [
      "Scrivi 20-30 ricerche tipiche dei clienti (es. «cambio gomme invernali prezzo», «gommista vicino a me»).",
      "Controlla quali già portano visite in Google Search Console e quali sono ricercate con Google Keyword Planner (gratuito con un account Google Ads).",
      "Assegna a ogni ricerca una sola pagina del sito: dove la pagina manca, è una pagina da creare.",
    ],
  },
  seo4: {
    why: "Una pagina per ogni servizio permette di comparire su ricerche specifiche. Un'unica pagina «Servizi» compete con tutto e vince raramente.",
    how: [
      "Elenca i 5-8 servizi o categorie che portano più margine.",
      "Crea una pagina per ciascuno: cosa include, per chi è, fasce di prezzo, domande frequenti e un pulsante di contatto.",
      "Collega le pagine dal menu e tra loro, con testi originali e non copiati dal fornitore.",
    ],
  },
  seo5: {
    why: "I link da siti autorevoli sono per Google un voto di fiducia: senza, anche un sito curato resta indietro rispetto a chi ne ha.",
    how: [
      "Chiedi un link ai partner naturali: marchi che rivendi, associazioni di categoria, fornitori, club e realtà che sponsorizzi.",
      "Iscriviti alle directory di qualità del settore e della zona (camera di commercio, portali di categoria).",
      "Proponi a una testata locale un contenuto utile (es. consigli per le gomme invernali) con il link al sito.",
    ],
  },
  seo6: {
    why: "I dati strutturati permettono a Google di mostrare stelle, orari, prezzi e domande direttamente nei risultati, che attirano più clic.",
    how: [
      "Aggiungi alla home il markup LocalBusiness (nome, indirizzo, orari, telefono): molti plugin lo fanno in automatico.",
      "Per le pagine con domande frequenti aggiungi il markup FAQ; per l'e-commerce il markup Product con prezzo e disponibilità.",
      "Verifica con lo strumento «Test dei risultati multimediali» di Google che non ci siano errori.",
    ],
  },
  seo7: {
    why: "Senza Search Console non sai quali pagine Google ha indicizzato né quali errori le tengono fuori: i problemi restano invisibili.",
    how: [
      "Vai su search.google.com/search-console e aggiungi il dominio, verificandolo con il record DNS.",
      "Invia la sitemap (di solito all'indirizzo tuosito.it/sitemap.xml).",
      "Ogni mese controlla il rapporto «Pagine» e correggi quelle escluse per errore.",
    ],
  },

  ct1: {
    why: "Un blog fermo da mesi dà l'idea di un sito trascurato e non intercetta le ricerche con cui i clienti si informano prima di comprare.",
    how: [
      "Raccogli le 10 domande che i clienti fanno più spesso al banco o al telefono.",
      "Scrivi una risposta completa per ciascuna (400-800 parole) e pubblicane due al mese.",
      "Condividi ogni articolo sui social e nella newsletter, e collegalo alle pagine servizio pertinenti.",
    ],
  },
  ct2: {
    why: "Solo una minoranza dei visitatori è pronta a comprare subito. Un contenuto utile in cambio del contatto permette di ricontattare tutti gli altri.",
    how: [
      "Scegli un'offerta utile e specifica (es. checklist «Pronti per l'inverno», guida alla scelta, preventivo in 2 minuti).",
      "Preparala in PDF o come modulo semplice e mettila in home e nelle pagine servizio con un form di 2-3 campi.",
      "Collega il modulo a un elenco email per poter inviare i contenuti successivi.",
    ],
  },
  ct3: {
    why: "Ogni campo in più nel modulo fa perdere richieste: spesso il cliente è già convinto e abbandona perché il form è lungo o non lo trova.",
    how: [
      "Riduci il modulo a nome, telefono o email e una riga di messaggio.",
      "Mettilo in ogni pagina servizio e in fondo alla home, non solo nella pagina Contatti.",
      "Affianca il numero cliccabile e un pulsante WhatsApp.",
    ],
  },
  ct4: {
    why: "Chi ha già lasciato un contatto compra più volte di un estraneo, e scrivergli costa pochissimo rispetto a un annuncio a pagamento.",
    how: [
      "Scegli un servizio email (Brevo e Mailchimp hanno piani gratuiti) e importa i contatti che hanno dato il consenso.",
      "Imposta una sequenza di benvenuto di 3-4 email in 10 giorni: chi siete, consigli utili, offerta.",
      "Invia una newsletter al mese con un contenuto utile e una sola proposta commerciale.",
    ],
  },
  ct5: {
    why: "Se i contenuti sono tutti promozionali, si perde chi sta ancora informandosi o confrontando, che è la maggior parte dei potenziali clienti.",
    how: [
      "Dividi i contenuti in tre fasi: scopro il problema, valuto le soluzioni, decido di comprare.",
      "Individua la fase più scoperta (di solito la seconda: confronti, casi, prezzi indicativi).",
      "Pubblica per quella fase un contenuto al mese e collegalo alla fase successiva con un invito all'azione.",
    ],
  },
  ct6: {
    why: "Senza tracciare le conversioni non sai quale canale porta contatti e vendite, e decidi dove investire a intuito.",
    how: [
      "Crea una proprietà Google Analytics 4 e collegala al sito (con il tag di Google o il plugin del tuo CMS).",
      "Imposta come eventi chiave: invio del modulo, clic sul telefono, clic su WhatsApp, acquisto.",
      "Dopo 30 giorni guarda il rapporto «Acquisizione» per capire da quali canali arrivano i contatti.",
    ],
  },

  so1: {
    why: "Chi ti cerca per nome guarda i social per capire se sei affidabile: profili incompleti o diversi dal sito fanno dubitare.",
    how: [
      "Usa lo stesso logo, nome e descrizione su tutti i canali.",
      "Compila contatti, orari, indirizzo e link al sito.",
      "Fissa in alto un post che spiega cosa fai e come ti si contatta.",
    ],
  },
  so2: {
    why: "Pubblicare a intermittenza riduce la copertura: l'algoritmo premia chi è costante e i clienti leggono l'inattività come chiusura.",
    how: [
      "Scegli 2-3 rubriche ripetibili (es. lavoro della settimana, consiglio pratico, offerta del mese).",
      "Prepara in una sola sessione i post del mese e programmali (Meta Business Suite è gratuito).",
      "Scegli un ritmo sostenibile: meglio 2 post a settimana per sei mesi che 7 per due settimane.",
    ],
  },
  so3: {
    why: "Uno stile diverso a ogni post rende il brand difficile da riconoscere e da ricordare.",
    how: [
      "Scrivi 5 aggettivi che descrivono come parla l'azienda (es. diretto, competente, vicino).",
      "Annota 5 parole da usare sempre e 5 da evitare.",
      "Condividi la pagina con chi scrive i post e rileggi gli ultimi 10 per allinearli.",
    ],
  },
  so4: {
    why: "Su social e Messenger arrivano richieste di preventivo: chi non riceve risposta in poche ore si rivolge al concorrente.",
    how: [
      "Attiva le notifiche dei messaggi sul telefono di chi gestisce la pagina.",
      "Imposta una risposta automatica con orari e numero WhatsApp.",
      "Fissa un controllo quotidiano (bastano 10 minuti) con un responsabile e un sostituto.",
    ],
  },
  so5: {
    why: "I video brevi hanno la maggiore copertura organica: raggiungono persone che non ti seguono ancora, senza pagare.",
    how: [
      "Gira con lo smartphone 20-40 secondi: un lavoro, un consiglio, il dietro le quinte.",
      "Aggiungi sempre i sottotitoli, perché molti guardano senza audio.",
      "Pubblica lo stesso file su Reels, Shorts e TikTok.",
    ],
  },
  so6: {
    why: "Se sito e social non si richiamano, si perde chi ti scopre su un canale e vuole contattarti sull'altro.",
    how: [
      "Aggiungi nel sito le icone dei social con il link ai profili.",
      "Inserisci il link al sito (o a WhatsApp) nella bio di ogni profilo.",
      "Nei post con un'offerta metti il link alla pagina dedicata.",
    ],
  },

  re1: {
    why: "La scheda Google è la prima cosa che vede chi cerca «vicino a me»: spesso è il vero biglietto da visita, prima ancora del sito.",
    how: [
      "Rivendica e verifica la scheda su business.google.com.",
      "Compila categorie, servizi, orari (anche festivi), descrizione e link di prenotazione; carica almeno 15 foto reali.",
      "Pubblica un post a settimana (offerte, novità) e rispondi alle domande degli utenti.",
    ],
  },
  re2: {
    why: "Quando il cliente sceglie tra tre schede Google, stelle e numero di recensioni pesano spesso più del prezzo: una media bassa o poche recensioni fanno scegliere il concorrente.",
    how: [
      "Elenca i clienti degli ultimi 6 mesi rimasti soddisfatti.",
      "Invia a tutti un messaggio personale con il link diretto alla recensione.",
      "Fissa un obiettivo (es. 10 nuove recensioni al mese) e controllalo a fine mese.",
    ],
  },
  re3: {
    why: "Rispondere mostra a chi legge come tratti i clienti, soprattutto quando c'è un problema: una risposta ben fatta a una recensione negativa può convincere più di molte positive.",
    how: [
      "Rispondi a tutte entro 48 ore, usando il nome del cliente e un dettaglio del servizio.",
      "Alle negative: ringrazia, riconosci il problema, proponi una soluzione e sposta il dialogo fuori dalla recensione.",
      "Evita risposte copiate: i clienti se ne accorgono.",
    ],
  },
  re4: {
    why: "Dire di essere bravi vale poco; mostrare cosa hai fatto per un cliente reale, con un risultato, vale molto di più.",
    how: [
      "Scegli 3 clienti soddisfatti e chiedi il permesso di raccontarli.",
      "Per ognuno scrivi: situazione di partenza, cosa avete fatto, risultato ottenuto (con un numero).",
      "Aggiungi foto e una frase del cliente e pubblica tutto in una pagina dedicata.",
    ],
  },
  re5: {
    why: "Certificazioni, marchi partner e garanzie rassicurano prima del contatto e riducono i dubbi di chi non ti conosce.",
    how: [
      "Mostra in home i loghi dei marchi partner, le certificazioni e gli anni di attività.",
      "Scrivi chiaramente garanzie, tempi e modalità di pagamento.",
      "Inserisci ragione sociale, partita IVA e indirizzo completi in fondo a ogni pagina.",
    ],
  },
  re6: {
    why: "Le recensioni che arrivano per caso sono poche e sbilanciate verso chi è arrabbiato: serve un metodo per chiederle a tutti i clienti soddisfatti.",
    how: [
      "Prendi il link diretto alla recensione dalla scheda Google e trasformalo in QR code.",
      "Mettilo al banco e sullo scontrino e invia un messaggio WhatsApp o SMS dopo ogni servizio.",
      "Assegna la richiesta a una persona precisa del team come compito fisso.",
    ],
  },

  ux1: {
    why: "Se il contenuto principale impiega troppo ad apparire, molti visitatori da smartphone se ne vanno prima di leggere, e Google tende a penalizzare le pagine lente.",
    how: [
      "Comprimi le immagini più pesanti e convertile in formato WebP (con strumenti gratuiti come Squoosh).",
      "Attiva la cache e il caricamento differito delle immagini fuori schermo (lazy loading).",
      "Elimina plugin e script inutilizzati e valuta un hosting più veloce se il server risponde lentamente.",
    ],
  },
  ux2: {
    why: "Un sito che risponde in ritardo a clic e tocchi dà l'impressione di essere rotto, e chi preme due volte un pulsante rischia di inviare due richieste.",
    how: [
      "Individua gli script di terze parti più pesanti (chat, pixel, slider) dal rapporto PageSpeed.",
      "Rimuovi quelli non essenziali e fai caricare gli altri solo dopo la prima interazione.",
      "Sostituisci gli slider animati con un'immagine statica e un invito all'azione.",
    ],
  },
  ux3: {
    why: "Quando gli elementi si spostano mentre la pagina si carica, il visitatore clicca per errore: è fastidioso e riduce la fiducia.",
    how: [
      "Imposta larghezza e altezza fisse su immagini e banner.",
      "Riserva lo spazio per il banner cookie e per i riquadri incorporati (mappe, video).",
      "Evita font che cambiano aspetto al caricamento: usa font-display: swap o font di sistema.",
    ],
  },
  ux4: {
    why: "La maggior parte delle visite arriva da smartphone: testi piccoli o pulsanti troppo vicini fanno perdere richieste che sarebbero già pronte.",
    how: [
      "Apri sul telefono le 5 pagine più visitate e prova a compilare il modulo e premere i pulsanti con una mano.",
      "Porta il testo ad almeno 16 px e lascia almeno 48 px di spazio attorno a ogni pulsante.",
      "Rendi il numero di telefono cliccabile e tieni sempre visibile il pulsante WhatsApp.",
    ],
  },
  ux5: {
    why: "Il visitatore decide in pochi secondi: se non vede subito cosa fare dopo, esce senza contattarti.",
    how: [
      "Scegli l'azione principale di ogni pagina (chiama, scrivi su WhatsApp, prenota, acquista).",
      "Mettila nella parte alta, ben visibile, con un testo concreto (es. «Prenota il cambio gomme»).",
      "Ripetila a metà e in fondo alla pagina.",
    ],
  },
  ux6: {
    why: "Un menu con troppe voci o etichette poco chiare fa perdere chi cerca una cosa precisa.",
    how: [
      "Riduci il menu a 5-7 voci, ordinate per importanza per il cliente.",
      "Usa le parole che usa lui (es. «Cambio gomme» invece di «Servizi»).",
      "Metti l'azione principale come ultima voce, ben evidenziata (es. «Prenota»).",
    ],
  },
  ux7: {
    why: "Senza HTTPS il browser avvisa che il sito «non è sicuro»: molti visitatori a quel punto lasciano la pagina o rinunciano a compilare i moduli.",
    how: [
      "Attiva il certificato SSL (spesso gratuito dal fornitore di hosting o con Let's Encrypt).",
      "Imposta il reindirizzamento 301 da http:// a https://.",
      "Correggi immagini e script ancora caricati con indirizzo http:// (contenuti misti).",
    ],
  },
};
