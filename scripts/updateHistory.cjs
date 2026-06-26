const fs = require('fs/promises');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const PRICES_PATH = path.join(ROOT_DIR, 'data', 'prices.json');
const HISTORICAL_PATH = path.join(ROOT_DIR, 'data', 'historical.json');

async function run() {
  const currentPrices = JSON.parse(await fs.readFile(PRICES_PATH, 'utf-8'));
  
  let history = {};
  try {
    history = JSON.parse(await fs.readFile(HISTORICAL_PATH, 'utf-8'));
  } catch (e) {
    // Inizializza il file se non esiste ancora
    history = {};
  }

  const todayStr = new Date().toISOString().split('T')[0];
  
  // Mappa l'asset snapshot del giorno
  history[todayStr] = {};
  Object.entries(currentPrices).forEach(([ginId, data]) => {
    history[todayStr][ginId] = data.price;
  });

  await fs.writeFile(HISTORICAL_PATH, JSON.stringify(history, null, 2));
  console.log(`Snapshot storico archiviato per la giornata del ${todayStr}.`);
}

run();