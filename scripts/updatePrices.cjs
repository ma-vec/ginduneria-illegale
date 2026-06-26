const fs = require('fs');
const path = require('path');

// Configurazione dei percorsi file
const GIN_LIST_PATH = path.join(__dirname, '../data/gin_list.json');
const GINS_MARKET_PATH = path.join(__dirname, '../data/gins.json');
const PRICES_PATH = path.join(__dirname, '../data/prices.json');
const INDICES_PATH = path.join(__dirname, '../data/indices.json');

function updateMarketPrices() {
  try {
    // 1. Verifica presenza file di dati (CORRETTO IL REFUSO QUI)
    if (!fs.existsSync(GIN_LIST_PATH) || !fs.existsSync(GINS_MARKET_PATH)) {
      throw new Error("File di dati mancanti. Verifica la presenza di gin_list.json e gins.json");
    }

    // Lettura file come stringhe grezze
    let ginListRaw = fs.readFileSync(GIN_LIST_PATH, 'utf-8');
    let ginsMarketRaw = fs.readFileSync(GINS_MARKET_PATH, 'utf-8');

    // Rimozione sicura del carattere invisibile BOM (\uFEFF) se presente
    if (ginListRaw.charCodeAt(0) === 0xFEFF) ginListRaw = ginListRaw.slice(1);
    if (ginsMarketRaw.charCodeAt(0) === 0xFEFF) ginsMarketRaw = ginsMarketRaw.slice(1);

    // Parsing dei JSON
    const ginList = JSON.parse(ginListRaw.trim());
    const ginsMarket = JSON.parse(ginsMarketRaw.trim());
    
    let marketIndices = {};
    if (fs.existsSync(INDICES_PATH)) {
      let indicesRaw = fs.readFileSync(INDICES_PATH, 'utf-8');
      if (indicesRaw.charCodeAt(0) === 0xFEFF) indicesRaw = indicesRaw.slice(1);
      marketIndices = JSON.parse(indicesRaw.trim());
    }

    // 2. Creazione della mappa di anagrafica centrale (ID -> Dati Statici)
    const staticDataMap = new Map(ginList.map(gin => [gin.id, gin]));

    // 3. Elaborazione e calcolo delle variazioni percentuali di borsa
    const updatedMarket = ginsMarket.map(marketGin => {
      const staticInfo = staticDataMap.get(marketGin.id);

      if (!staticInfo) {
        console.warn(`[WARN] ID "${marketGin.id}" presente nel mercato ma non trovato in gin_list.json. Salto il calcolo.`);
        return marketGin;
      }

      // --- RECUPERO DATI DALL'ANAGRAFICA CENTRALIZZATA ---
      const esgTot = staticInfo.ethicalIndex?.tot || 50;       
      const tradition = staticInfo.ethicalIndex?.trad || 50; // ALLINEATO A "trad" DEL TUO JSON
      const isLimited = staticInfo.limitedEdition !== undefined && staticInfo.limitedEdition !== null; 

      // --- ALGORITMO DI VARIAZIONE DI BORSA ---
      let exposureImpact = 0;
      if (marketGin.exposure) {
        Object.keys(marketGin.exposure).forEach(sector => {
          const weight = marketGin.exposure[sector] / 100; 
          const sectorTrend = Number(marketIndices[sector]?.change ?? 0);  
          exposureImpact += sectorTrend * weight;
        });
      }

      // Correzione algoritmica basata sulle caratteristiche fondamentali
      let fundamentalBonus = 0;
      if (esgTot > 80) fundamentalBonus += 0.5;      // Premio sostenibilità
      if (tradition > 80) fundamentalBonus += 0.3;   // Premio tradizione
      if (isLimited) fundamentalBonus += 1.2;        // Premio scarsità (Edizione Limitata)

      // Volatilità di fondo: fluttuazione casuale tra -1.5% e +1.5%
      const volatility = (Math.random() * 3) - 1.5;

      // Variazione percentuale totale applicata ogni 3 ore
      const totalVariationPercentage = exposureImpact + fundamentalBonus + volatility;

      // Calcolo del nuovo prezzo indicizzato (partenza base 100)
      const previousPrice = Number(marketGin.currentPrice ?? marketGin.basePrice ?? 100);
      let newPrice = previousPrice * (1 + totalVariationPercentage / 100);
      if (newPrice < 10) newPrice = 10; // Pavimento minimo protettivo
      const priceChange = previousPrice > 0
        ? ((newPrice - previousPrice) / previousPrice) * 100
        : 0;

      return {
        ...marketGin,
        currentPrice: Number(newPrice.toFixed(2)),
        priceChange: Number(priceChange.toFixed(2))
      };
    });

    const priceSnapshot = Object.fromEntries(
      updatedMarket.map(marketGin => [marketGin.id, {
        price: marketGin.currentPrice,
        change: marketGin.priceChange ?? 0
      }])
    );

    // 4. Salvataggio del listino aggiornato su disco
    fs.writeFileSync(GINS_MARKET_PATH, JSON.stringify(updatedMarket, null, 2), 'utf-8');
    fs.writeFileSync(PRICES_PATH, JSON.stringify(priceSnapshot, null, 2), 'utf-8');
    console.log(`[SUCCESS] Borsa Aggiornata: calcolati i valori correnti per tutti i ${updatedMarket.length} gin.`);

  } catch (error) {
    console.error("[ERROR] Errore critico durante l'aggiornamento dei prezzi:", error.message);
    process.exit(1);
  }
}

// Esecuzione dello script
updateMarketPrices();