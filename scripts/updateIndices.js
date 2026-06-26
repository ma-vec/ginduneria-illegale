import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const KEYWORDS_PATH = path.join(ROOT_DIR, 'config', 'keywords.json');
const SEASONALITY_PATH = path.join(ROOT_DIR, 'config', 'seasonality.json');
const INDICES_PATH = path.join(ROOT_DIR, 'data', 'indices.json');

async function fetchNewsCount(indexName, keywords) {
  try {
    // Interroga Google News usando il nome dell'indice come macro-categoria
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(indexName.toLowerCase())}&hl=en-US&gl=US&ceid=US:en`;
    const response = await fetch(url);
    if (!response.ok) return 0;
    
    const text = await response.text();
    // Estrazione nativa dei titoli degli articoli tramite Regex
    const titles = [...text.matchAll(/<title>(.*?)<\/title>/g)].map(m => m[1].toLowerCase());
    
    let matches = 0;
    titles.forEach(title => {
      keywords.forEach(keyword => {
        if (title.includes(keyword.toLowerCase())) matches++;
      });
    });
    return matches;
  } catch (error) {
    console.error(`Errore nel fetching per l'indice ${indexName}:`, error);
    return 0;
  }
}

async function run() {
  const keywordsData = JSON.parse(await fs.readFile(KEYWORDS_PATH, 'utf-8'));
  const seasonalityData = JSON.parse(await fs.readFile(SEASONALITY_PATH, 'utf-8'));
  const indices = JSON.parse(await fs.readFile(INDICES_PATH, 'utf-8'));
  
  const today = new Date();
  const currentMonth = today.getMonth(); // 0-11
  const dateStr = today.toISOString().split('T')[0];

  // Trova i modificatori stagionali attivi
  let activeSeasonModifiers = {};
  for (const season of Object.values(seasonalityData)) {
    if (season.months.includes(currentMonth)) {
      activeSeasonModifiers = season.modifiers;
      break;
    }
  }

  // Aggiorna ogni indice tematico
  for (const [indexName, keywords] of Object.entries(keywordsData)) {
    if (indexName === 'ESG' || indexName === 'TRADITION') {
      // Questi indici sistemici sono la media degli altri indici di mercato
      continue;
    }

    const matchCount = await fetchNewsCount(indexName, keywords);
    
    // Algoritmo di normalizzazione della volatilità di borsa (max +/- 2.5% giornaliero dalle news)
    let dailyChangePercent = Math.min(Math.max((matchCount / 10) - 1, -2.5), 2.5);

    // Integrazione del vettore stagionale
    if (activeSeasonModifiers[indexName]) {
      dailyChangePercent += activeSeasonModifiers[indexName];
    }

    const indexInfo = indices[indexName];
    indexInfo.previous = indexInfo.value;
    // Calcolo dell'indice composto compounding
    indexInfo.value = parseFloat((indexInfo.value * (1 + dailyChangePercent / 100)).toFixed(2));
    indexInfo.change = parseFloat(dailyChangePercent.toFixed(2));
    indexInfo.lastUpdate = dateStr;
  }

  // Calcolo matematico degli indici sistemici ESG e TRADITION (media ponderata del mercato)
  const activeIndices = Object.keys(indices).filter(k => k !== 'ESG' && k !== 'TRADITION');
  const marketAvgChange = activeIndices.reduce((sum, k) => sum + indices[k].change, 0) / activeIndices.length;
  
  ['ESG', 'TRADITION'].forEach(sysIndex => {
    indices[sysIndex].previous = indices[sysIndex].value;
    indices[sysIndex].change = parseFloat(marketAvgChange.toFixed(2));
    indices[sysIndex].value = parseFloat((indices[sysIndex].value * (1 + marketAvgChange / 100)).toFixed(2));
    indices[sysIndex].lastUpdate = dateStr;
  });

  await fs.writeFile(INDICES_PATH, JSON.stringify(indices, null, 2));
  console.log('Indici di mercato aggiornati con successo.');
}

run();