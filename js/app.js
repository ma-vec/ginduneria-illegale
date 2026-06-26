document.addEventListener('DOMContentLoaded', () => {
    const marketFloor = document.getElementById('market-floor');

    async function readJson(url, fallbackValue) {
        try {
            const response = await fetch(url);

            if (!response.ok) {
                return fallbackValue;
            }

            const text = await response.text();
            if (!text.trim()) {
                return fallbackValue;
            }

            return JSON.parse(text);
        } catch (error) {
            return fallbackValue;
        }
    }

    async function initMarket() {
        try {
            const gins = await readJson('data/gins.json', []);
            const currentPrices = await readJson('data/prices.json', {});
            const listData = await readJson('data/gin_list.json', []);
            const listById = Array.isArray(listData)
                ? Object.fromEntries(
                    listData
                        .filter(item => item && item.id)
                        .map(item => [item.id, item])
                )
                : {};

            marketFloor.innerHTML = '';

            gins.forEach(gin => {
                const fallbackPrice = Number(gin.currentPrice ?? gin.basePrice ?? 100);
                const liveData = currentPrices[gin.id] || { price: fallbackPrice, change: 0.0 };
                const price = Number(liveData.price ?? fallbackPrice);
                const changeValue = Number.isFinite(Number(liveData.change)) ? Number(liveData.change) : 0;
                const listItem = listById[gin.id] || {};
                const ethicalIndex = listItem.ethicalIndex || {};
                const esgScore = Number.isFinite(Number(ethicalIndex.tot)) ? Number(ethicalIndex.tot) : null;
                const tradScore = Number.isFinite(Number(ethicalIndex.trad)) ? Number(ethicalIndex.trad) : null;
                const isLimited = typeof listItem.limited === 'string'
                    ? listItem.limited.trim().length > 0
                    : Boolean(listItem.limited);
                
                const card = document.createElement('div');
                card.className = 'card';
                
                card.innerHTML = `
                    <div class="card-header">
                        <div>
                            <h2 class="gin-name">${gin.name}</h2>
                            ${isLimited ? '<span class="badge-limited">Limited Edition</span>' : ''}
                        </div>
                        <div class="price-box">
                            <div class="price">Score: ${price.toFixed(2)}</div>
                            <div class="change ${changeValue >= 0 ? 'up' : 'down'}">
                                ${changeValue >= 0 ? '▲' : '▼'} ${Math.abs(changeValue).toFixed(2)}%
                            </div>
                        </div>
                    </div>
                    
                    <div class="scores">
                        <div><strong>ESG Score:</strong> ${esgScore !== null ? `${esgScore}/100` : 'N/D'}</div>
                        <div><strong>Tradizione:</strong> ${tradScore !== null ? `${tradScore}/100` : 'N/D'}</div>
                    </div>
                    
                    <div class="exposures">
                        <div><strong>Esposizioni attive nel paniere:</strong></div>
                        ${Object.entries(gin.exposure)
                            .map(([index, weight]) => `<span class="exp-tag">${index}: ${weight}%</span>`)
                            .join('')}
                    </div>
                `;
                marketFloor.appendChild(card);
            });

        } catch (error) {
            console.error("Errore nell'inizializzazione del tabellone di borsa:", error);
            marketFloor.innerHTML = `<p style="color: var(--bearish)">Errore nel caricamento del listino in tempo reale.</p>`;
        }
    }

    initMarket();
});