document.addEventListener('DOMContentLoaded', () => {
    const marketFloor = document.getElementById('market-floor');
    const marketStats = document.getElementById('market-stats');
    const indexTape = document.getElementById('index-tape');
    const historyChart = document.getElementById('history-chart');
    const historySummary = document.getElementById('history-summary');
    const historyControls = document.getElementById('history-controls');
    const walletBarChart = document.getElementById('wallet-bar-chart');
    const allocationDonut = document.getElementById('allocation-donut');
    const allocationDonutCenter = document.getElementById('allocation-donut-center');
    const allocationLegend = document.getElementById('allocation-legend');
    const indexBook = document.getElementById('index-book');

    if (!marketFloor) {
        return;
    }

    const INDEX_LABELS = {
        ESG: 'World SRI gin',
        EMERGING: 'EM',
        ART: 'ART',
        SEA: 'SEA',
        TRADITION: 'TRD',
        BOTANICALS: 'BTN',
        NORDIC: 'NRD',
        EXPLORATION: 'EXP',
        LUXURY: 'LXR',
        HERITAGE: 'HRT'
    };

    const INDEX_COPY = {
        EXPLORATION: 'Investe in società di innovazione botanica',
        SEA: 'Investe nel settore marittimo e costiero',
        BOTANICALS: ' Investe nella filiera botanica',
        LUXURY: 'Gamma alta e posizionamento premium.',
        ART: 'Marchi a forte componente estetica.',
        HERITAGE: 'Bottiglie storiche e identità territoriale.',
        TRADITION: 'Continuità produttiva e metodo.',
        NORDIC: 'Distillati essenziali di matrice nordica.',
        EMERGING: 'Brand in fase di crescita.',
        ESG: 'Profilo etico e sostenibile.'
    };

    const INDEX_COLORS = {
        ESG: '#78d7c5',
        EMERGING: '#f0b35a',
        ART: '#ff6e8b',
        SEA: '#5d9fff',
        TRADITION: '#d6a04a',
        BOTANICALS: '#57c66c',
        NORDIC: '#b8d6ea',
        EXPLORATION: '#cfd46b',
        LUXURY: '#d7b55e',
        HERITAGE: '#a38b64'
    };

    const INDEX_ORDER = ['ESG', 'SEA', 'BOTANICALS', 'EXPLORATION', 'LUXURY', 'ART', 'HERITAGE', 'NORDIC', 'EMERGING', 'TRADITION'];
    const HISTORY_WINDOWS = [
        { key: '5D', label: '5D', size: 5 },
        { key: '10D', label: '10D', size: 10 },
        { key: '1M', label: '1M', size: 30 },
        { key: '3M', label: '3M', size: 90 },
        { key: '6M', label: '6M', size: 180 }
    ];

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

    function formatNumber(value, digits = 2) {
        return new Intl.NumberFormat('it-IT', {
            minimumFractionDigits: digits,
            maximumFractionDigits: digits
        }).format(Number.isFinite(Number(value)) ? Number(value) : 0);
    }

    function formatSigned(value, digits = 2) {
        const numericValue = Number.isFinite(Number(value)) ? Number(value) : 0;
        const prefix = numericValue > 0 ? '+' : '';
        return `${prefix}${formatNumber(numericValue, digits)}%`;
    }

    function formatHistoryDate(date) {
        const parsedDate = new Date(`${date}T00:00:00`);

        if (Number.isNaN(parsedDate.getTime())) {
            return date;
        }

        return new Intl.DateTimeFormat('it-IT', {
            day: '2-digit',
            month: 'short'
        }).format(parsedDate);
    }

    function aggregateHistoricalSeries(historicalData) {
        return Object.entries(historicalData || {})
            .map(([date, prices]) => ({
                date,
                totalValue: Object.values(prices || {}).reduce((sum, value) => sum + (Number(value) || 0), 0)
            }))
            .filter(point => Number.isFinite(point.totalValue) && point.totalValue > 0)
            .sort((left, right) => left.date.localeCompare(right.date));
    }

    function buildHistoryWindow(series, windowSize) {
        return series.slice(-Math.max(1, Math.min(windowSize, series.length)));
    }

    function buildChartGeometry(series) {
        const width = 920;
        const height = 360;
        const padding = 28;
        const chartWidth = width - (padding * 2);
        const chartHeight = height - (padding * 2);
        const minValue = Math.min(...series.map(point => point.totalValue));
        const maxValue = Math.max(...series.map(point => point.totalValue));
        const valueRange = Math.max(maxValue - minValue, 1);
        const stepX = series.length > 1 ? chartWidth / (series.length - 1) : 0;
        const points = series.map((point, index) => ({
            ...point,
            x: padding + (stepX * index),
            y: padding + chartHeight - (((point.totalValue - minValue) / valueRange) * chartHeight)
        }));

        const linePath = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(' ');
        const areaPath = `${linePath} L ${points.at(-1).x.toFixed(2)} ${height - padding} L ${points[0].x.toFixed(2)} ${height - padding} Z`;

        return { width, height, padding, points, minValue, maxValue, linePath, areaPath };
    }

    function normalizeExposure(exposure = {}) {
        return Object.entries(exposure)
            .map(([index, weight]) => ({ index, weight: Number(weight) || 0 }))
            .filter(item => item.weight > 0)
            .sort((left, right) => right.weight - left.weight);
    }

    function getDominantExposure(gin) {
        const exposures = normalizeExposure(gin.exposure);
        return exposures[0] || null;
    }

    function buildIndexBook(gins, currentPrices, listById) {
        const indexMap = new Map();

        gins.forEach(gin => {
            const fallbackPrice = Number(gin.currentPrice ?? gin.basePrice ?? 100);
            const liveData = currentPrices[gin.id] || { price: fallbackPrice, change: 0.0 };
            const price = Number(liveData.price ?? fallbackPrice);
            const exposures = normalizeExposure(gin.exposure);
            const listItem = listById?.[gin.id] || {};
            const ethicalIndex = listItem.ethicalIndex || {};
            const esgScore = Number(ethicalIndex.tot);
            const hasExplicitEsgExposure = exposures.some(item => item.index === 'ESG');

            exposures.forEach(({ index, weight }) => {
                const contribution = price * (weight / 100);

                if (!indexMap.has(index)) {
                    indexMap.set(index, {
                        code: index,
                        label: INDEX_LABELS[index] || index,
                        description: INDEX_COPY[index] || 'Indice senza descrizione dedicata nel listino attuale.',
                        color: INDEX_COLORS[index] || '#d7b55e',
                        totalWeight: 0,
                        totalValue: 0,
                        items: []
                    });
                }

                const bucket = indexMap.get(index);
                bucket.totalWeight += weight;
                bucket.totalValue += contribution;
                bucket.items.push({
                    id: gin.id,
                    name: gin.name,
                    weight,
                    contribution
                });
            });

            if (!hasExplicitEsgExposure && Number.isFinite(esgScore) && esgScore >= 85) {
                if (!indexMap.has('ESG')) {
                    indexMap.set('ESG', {
                        code: 'ESG',
                        label: INDEX_LABELS.ESG,
                        description: INDEX_COPY.ESG,
                        color: INDEX_COLORS.ESG,
                        totalWeight: 0,
                        totalValue: 0,
                        items: []
                    });
                }

                const bucket = indexMap.get('ESG');
                bucket.totalWeight += esgScore;
                bucket.totalValue += price * (esgScore / 100);
                bucket.items.push({
                    id: gin.id,
                    name: gin.name,
                    weight: esgScore,
                    contribution: price * (esgScore / 100)
                });
            }
        });

        const entries = Array.from(indexMap.values())
            .map(item => ({
                ...item,
                items: item.items.sort((left, right) => right.contribution - left.contribution)
            }))
            .sort((left, right) => {
                const leftPriority = INDEX_ORDER.indexOf(left.code);
                const rightPriority = INDEX_ORDER.indexOf(right.code);

                if (leftPriority !== rightPriority) {
                    if (leftPriority === -1) {
                        return 1;
                    }

                    if (rightPriority === -1) {
                        return -1;
                    }

                    return leftPriority - rightPriority;
                }

                return right.totalValue - left.totalValue;
            });

        return entries;
    }

    function renderHistoricalChart(target, summaryTarget, controlsTarget, series) {
        if (!target || !summaryTarget || !controlsTarget) {
            return;
        }

        if (!series.length) {
            target.innerHTML = '<div class="history-chart__empty">Nessun dato storico disponibile.</div>';
            summaryTarget.innerHTML = '<strong>N/D</strong><span>Serie storica vuota</span>';
            controlsTarget.innerHTML = '';
            return;
        }

        let activeWindow = HISTORY_WINDOWS[2];

        const renderWindow = windowConfig => {
            const visibleSeries = buildHistoryWindow(series, windowConfig.size);
            const geometry = buildChartGeometry(visibleSeries);
            const firstPoint = visibleSeries[0];
            const lastPoint = visibleSeries[visibleSeries.length - 1];
            const previousPoint = visibleSeries[visibleSeries.length - 2] || firstPoint;
            const periodChange = previousPoint.totalValue > 0
                ? ((lastPoint.totalValue - firstPoint.totalValue) / firstPoint.totalValue) * 100
                : 0;
            const latestChange = previousPoint.totalValue > 0
                ? ((lastPoint.totalValue - previousPoint.totalValue) / previousPoint.totalValue) * 100
                : 0;

            target.innerHTML = `
                <svg viewBox="0 0 ${geometry.width} ${geometry.height}" class="history-chart__svg" role="img" aria-label="Andamento storico del mercato">
                    <defs>
                        <linearGradient id="historyFill" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stop-color="rgba(69, 209, 176, 0.32)"></stop>
                            <stop offset="100%" stop-color="rgba(69, 209, 176, 0.02)"></stop>
                        </linearGradient>
                    </defs>
                    <g class="history-chart__grid">
                        ${Array.from({ length: 5 }, (_, index) => {
                            const y = geometry.padding + ((geometry.height - (geometry.padding * 2)) / 4) * index;
                            return `<line x1="${geometry.padding}" y1="${y}" x2="${geometry.width - geometry.padding}" y2="${y}"></line>`;
                        }).join('')}
                    </g>
                    <path d="${geometry.areaPath}" fill="url(#historyFill)"></path>
                    <path d="${geometry.linePath}" fill="none" stroke="var(--bullish)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"></path>
                    <g>
                        ${geometry.points.map(point => `<circle cx="${point.x}" cy="${point.y}" r="4.5" fill="var(--bullish)" stroke="rgba(7,10,13,0.96)" stroke-width="2"></circle>`).join('')}
                    </g>
                </svg>
                <div class="history-chart__labels">
                    <span>${formatHistoryDate(firstPoint.date)}</span>
                    <span>${formatHistoryDate(lastPoint.date)}</span>
                </div>
                <div class="history-chart__meta">
                    <span>Range ${windowConfig.key}</span>
                    <strong>${formatSigned(periodChange)} nel periodo</strong>
                </div>
            `;

            summaryTarget.innerHTML = `
                <strong>${formatNumber(lastPoint.totalValue)}</strong>
                <span class="${latestChange >= 0 ? 'is-up' : 'is-down'}">${formatSigned(latestChange)} vs seduta precedente</span>
            `;

            controlsTarget.innerHTML = HISTORY_WINDOWS.map(windowItem => `
                <button type="button" class="history-control ${windowItem.key === windowConfig.key ? 'is-active' : ''}" data-window="${windowItem.key}">${windowItem.label}</button>
            `).join('');

        };

        renderWindow(activeWindow);

        controlsTarget.addEventListener('click', event => {
            const button = event.target.closest('[data-window]');

            if (!button) {
                return;
            }

            const nextWindow = HISTORY_WINDOWS.find(windowItem => windowItem.key === button.dataset.window);

            if (!nextWindow) {
                return;
            }

            activeWindow = nextWindow;
            renderWindow(activeWindow);
        });
    }

    function renderStats(statsTarget, gins, currentPrices, indexEntries, listById) {
        const totalValue = gins.reduce((sum, gin) => {
            const fallbackPrice = Number(gin.currentPrice ?? gin.basePrice ?? 100);
            const liveData = currentPrices[gin.id] || { price: fallbackPrice, change: 0.0 };
            return sum + Number(liveData.price ?? fallbackPrice);
        }, 0);

        const weightedChange = gins.reduce((sum, gin) => {
            const fallbackPrice = Number(gin.currentPrice ?? gin.basePrice ?? 100);
            const liveData = currentPrices[gin.id] || { price: fallbackPrice, change: 0.0 };
            const price = Number(liveData.price ?? fallbackPrice);
            const change = Number.isFinite(Number(liveData.change)) ? Number(liveData.change) : Number(gin.priceChange ?? 0);
            return sum + (price * change);
        }, 0) / Math.max(totalValue, 1);

        const limitedCount = gins.filter(gin => {
            const listItem = listById[gin.id] || {};
            return typeof listItem.limited === 'string' ? listItem.limited.trim().length > 0 : Boolean(listItem.limited);
        }).length;

        const activeIndexes = new Set();
        gins.forEach(gin => {
            Object.entries(gin.exposure || {}).forEach(([index, weight]) => {
                if (Number(weight) > 0) {
                    activeIndexes.add(index);
                }
            });
        });

        const bestMover = [...gins]
            .map(gin => {
                const fallbackPrice = Number(gin.currentPrice ?? gin.basePrice ?? 100);
                const liveData = currentPrices[gin.id] || { price: fallbackPrice, change: 0.0 };
                const change = Number.isFinite(Number(liveData.change)) ? Number(liveData.change) : Number(gin.priceChange ?? 0);
                return { name: gin.name, change };
            })
            .sort((left, right) => right.change - left.change)[0];

        statsTarget.innerHTML = `
            <div class="stat-card">
                <span class="stat-card__label">Wallet value</span>
                <span class="stat-card__value">${formatNumber(totalValue)}</span>
                <span class="stat-card__meta">Somma delle quotazioni live</span>
            </div>
            <div class="stat-card">
                <span class="stat-card__label">Daily drift</span>
                <span class="stat-card__value ${weightedChange >= 0 ? 'is-up' : 'is-down'}">${formatSigned(weightedChange)}</span>
                <span class="stat-card__meta">Media ponderata del cambio giornaliero</span>
            </div>
            <div class="stat-card">
                <span class="stat-card__label">ETF/ETC</span>
                <span class="stat-card__value">${activeIndexes.size+1}</span>
                <span class="stat-card__meta">Indici con almeno una esposizione nel wallet</span>
            </div>
            <div class="stat-card">
                <span class="stat-card__label">Limited editions</span>
                <span class="stat-card__value">${limitedCount}</span>
                <span class="stat-card__meta">Bottiglie da collezione</span>
            </div>
        `;

        return bestMover;
    }

    function renderIndexTape(target, indexData) {
        if (!target) {
            return;
        }

        const orderedCodes = INDEX_ORDER.filter(code => indexData[code]).concat(
            Object.keys(indexData).filter(code => !INDEX_ORDER.includes(code))
        );

        target.innerHTML = orderedCodes.map(code => {
            const entry = indexData[code];
            const change = Number(entry.change ?? 0);

            return `
                <div class="tape-chip" style="--chip-color: ${INDEX_COLORS[code] || '#d7b55e'}">
                    <span class="tape-chip__code">${code}</span>
                    <span class="tape-chip__value">${formatNumber(entry.value)}</span>
                    <span class="tape-chip__change ${change >= 0 ? 'is-up' : 'is-down'}">${formatSigned(change)}</span>
                </div>
            `;
        }).join('');
    }

    function renderWalletBars(target, gins, currentPrices) {
        const sortedGins = [...gins].map(gin => {
            const fallbackPrice = Number(gin.currentPrice ?? gin.basePrice ?? 100);
            const liveData = currentPrices[gin.id] || { price: fallbackPrice, change: 0.0 };
            const price = Number(liveData.price ?? fallbackPrice);
            const change = Number.isFinite(Number(liveData.change)) ? Number(liveData.change) : Number(gin.priceChange ?? 0);
            const basePrice = Number(gin.basePrice ?? price);

            return {
                ...gin,
                price,
                change,
                basePrice,
                ratio: basePrice > 0 ? price / basePrice : 1
            };
        }).sort((left, right) => right.price - left.price);

        const maxPrice = Math.max(...sortedGins.map(gin => gin.price), 1);

        target.innerHTML = sortedGins.map(gin => {
            const dominant = getDominantExposure(gin);
            const height = Math.max(18, Math.round((gin.price / maxPrice) * 100));

            return `
                <div class="wallet-bar">
                    <div class="wallet-bar__head">
                        <span class="wallet-bar__name">${gin.name}</span>
                        <span class="wallet-bar__price">${formatNumber(gin.price)}</span>
                        <span class="wallet-bar__delta ${gin.change >= 0 ? 'is-up' : 'is-down'}">${formatSigned(gin.change)}</span>
                    </div>
                    <div class="wallet-bar__track" aria-hidden="true">
                        <div class="wallet-bar__fill ${gin.change < 0 ? 'is-down' : ''}" style="height: ${height}%;"></div>
                    </div>
                    <div class="wallet-bar__foot">
                        <small>${dominant ? `Top basket ${dominant.index}` : 'No basket'}</small>
                        <strong>Vs base ${formatSigned((gin.ratio - 1) * 100)}</strong>
                    </div>
                </div>
            `;
        }).join('');
    }

    function renderAllocation(target, centerTarget, legendTarget, indexEntries) {
        const totalAllocation = indexEntries.reduce((sum, entry) => sum + entry.totalValue, 0);
        const meaningfulEntries = indexEntries.filter(entry => entry.totalValue > 0);

        if (!meaningfulEntries.length) {
            target.style.background = 'rgba(255,255,255,0.05)';
            centerTarget.innerHTML = `<strong>0.00</strong><span>Nessuna esposizione disponibile</span>`;
            legendTarget.innerHTML = '<div class="empty-state">Non ci sono ancora panieri da mostrare.</div>';
            return;
        }

        let currentAngle = 0;
        const segments = meaningfulEntries.map(entry => {
            const share = entry.totalValue / totalAllocation;
            const degrees = share * 360;
            const start = currentAngle;
            currentAngle += degrees;
            return `${entry.color} ${start}deg ${currentAngle}deg`;
        });

        target.style.background = `conic-gradient(from 180deg, ${segments.join(', ')})`;

        const topAllocation = meaningfulEntries[0];
        centerTarget.innerHTML = `
            <strong>${formatNumber(totalAllocation)}</strong>
            <span>peso tematico</span>
        `;

        legendTarget.innerHTML = meaningfulEntries.slice(0, 6).map(entry => {
            const share = entry.totalValue / totalAllocation;
            const holdingText = entry.items.slice(0, 3).map(item => item.name).join(' · ');

            return `
                <div class="legend-row">
                    <span class="legend-swatch" style="--legend-color: ${entry.color}"></span>
                    <div class="legend-row__label">
                        <strong>${entry.code} · ${entry.label}</strong>
                        <span>${entry.items.length} bottiglie${holdingText ? ` | ${holdingText}` : ''}</span>
                    </div>
                    <span class="legend-row__value">${formatNumber(share * 100)}%</span>
                </div>
            `;
        }).join('');

        if (topAllocation) {
            target.setAttribute('aria-label', `Allocazione guidata dal paniere ${topAllocation.code}`);
        }
    }

    function renderIndexBook(target, indexEntries, currentPrices, ginsById) {
        target.innerHTML = indexEntries.map(entry => {
            const topThree = entry.items.slice(0, 3);
            const share = entry.totalValue;
            const hasMembers = entry.items.length > 0;

            if (!hasMembers) {
                return `
                    <article class="index-card index-card--empty" style="--accent-color: ${entry.color}; --accent-soft: ${entry.color}22">
                        <div class="index-card__top">
                            <div>
                                <span class="index-card__code">${entry.code}</span>
                                <h3>${entry.label}</h3>
                            </div>
                            <div class="index-card__value">
                                <strong>${formatNumber(0)}</strong>
                                <span>0 bottiglie</span>
                            </div>
                        </div>
                        <p class="index-card__copy">${entry.description}</p>
                        <div class="index-card__meta">
                            <span class="pill">0 bottiglie</span>
                        </div>
                        <div class="index-card__bar"><span style="width: 0%"></span></div>
                    </article>
                `;
            }

            const dominant = topThree[0];
            const totalValue = share;
            const largestContribution = Math.max(...entry.items.map(item => item.contribution), 1);

            return `
                <article class="index-card" style="--accent-color: ${entry.color}; --accent-soft: ${entry.color}22">
                    <div class="index-card__top">
                        <div>
                            <span class="index-card__code">${entry.code}</span>
                            <h3>${entry.label}</h3>
                        </div>
                        <div class="index-card__value">
                            <strong>${formatNumber(totalValue)}</strong>
                            <span>${entry.items.length} bottiglie</span>
                        </div>
                    </div>
                    <p class="index-card__copy">${entry.description}</p>
                    <div class="index-card__meta">
                        <span class="pill">Lead ${dominant ? dominant.name : 'N/D'}</span>
                    </div>
                    <div class="index-card__bar"><span style="width: ${Math.max(12, Math.min(100, (largestContribution / (entry.totalValue || 1)) * 100))}%"></span></div>
                    <div class="index-card__holdings">
                        ${topThree.map(item => `<span class="holding-chip">${item.name}</span>`).join('')}
                    </div>
                </article>
            `;
        }).join('');
    }

    function renderGinCards(target, gins, currentPrices, listById) {
        target.innerHTML = gins.map(gin => {
            const fallbackPrice = Number(gin.currentPrice ?? gin.basePrice ?? 100);
            const liveData = currentPrices[gin.id] || { price: fallbackPrice, change: 0.0 };
            const price = Number(liveData.price ?? fallbackPrice);
            const change = Number.isFinite(Number(liveData.change)) ? Number(liveData.change) : Number(gin.priceChange ?? 0);
            const listItem = listById[gin.id] || {};
            const ethicalIndex = listItem.ethicalIndex || {};
            const esgScore = Number.isFinite(Number(ethicalIndex.tot)) ? Number(ethicalIndex.tot) : null;
            const tradScore = Number.isFinite(Number(ethicalIndex.trad)) ? Number(ethicalIndex.trad) : null;
            const isLimited = typeof listItem.limited === 'string'
                ? listItem.limited.trim().length > 0
                : Boolean(listItem.limited);
            const dominant = getDominantExposure(gin);
            const exposures = normalizeExposure(gin.exposure);
            const basePrice = Number(gin.basePrice ?? price);
            const moveFromBase = basePrice > 0 ? ((price - basePrice) / basePrice) * 100 : 0;
            const accent = listItem['bg-color'] || '#d7b55e';

            return `
                <article class="asset-card" style="--asset-accent: ${accent};">
                    <div class="card-header">
                        <div>
                            <h2 class="gin-name">${gin.name}</h2>
                            <div class="asset-meta">${dominant ? `Dominant basket: ${dominant.index}` : 'Dominant basket: N/D'}</div>
                            ${isLimited ? '<span class="badge-limited">Limited Edition</span>' : ''}
                        </div>
                        <div class="price-box">
                            <span class="price-label">Quotazione</span>
                            <div class="price">${formatNumber(price)}</div>
                            <div class="change ${change >= 0 ? 'is-up' : 'is-down'}">${change >= 0 ? '▲' : '▼'} ${formatSigned(change)}</div>
                        </div>
                    </div>

                    <div class="asset-metrics">
                        <div class="metric-box">
                            <span>ESG</span>
                            <strong>${esgScore !== null ? `${esgScore}/100` : 'N/D'}</strong>
                        </div>
                        <div class="metric-box">
                            <span>Tradizione</span>
                            <strong>${tradScore !== null ? `${tradScore}/100` : 'N/D'}</strong>
                        </div>
                    </div>

                    <div class="asset-strip">
                        <div class="asset-strip__row">
                            <span>Vs base</span>
                            <strong class="${moveFromBase >= 0 ? 'is-up' : 'is-down'}">${formatSigned(moveFromBase)}</strong>
                        </div>
                        <div class="asset-bar"><span style="width: ${Math.min(100, Math.max(12, (price / Math.max(...gins.map(item => Number(currentPrices[item.id]?.price ?? item.currentPrice ?? item.basePrice ?? 100)), 1)) * 100))}%"></span></div>
                    </div>

                    <div class="asset-tags">
                        ${exposures.map(item => `<span class="exp-tag">${item.index} · ${formatNumber(item.weight)}%</span>`).join('')}
                    </div>
                </article>
            `;
        }).join('');
    }

    async function initMarket() {
        try {
            const gins = await readJson('data/gins.json', []);
            const currentPrices = await readJson('data/prices.json', {});
            const indices = await readJson('data/indices.json', {});
            const historicalData = await readJson('data/historical.json', {});
            const listData = await readJson('data/gin_list.json', []);
            const listById = Array.isArray(listData)
                ? Object.fromEntries(
                    listData
                        .filter(item => item && item.id)
                        .map(item => [item.id, item])
                )
                : {};

            const ginsById = Object.fromEntries(gins.map(gin => [gin.id, gin]));
            const indexEntries = buildIndexBook(gins, currentPrices, listById);
            const historicalSeries = aggregateHistoricalSeries(historicalData);

            renderStats(marketStats, gins, currentPrices, indexEntries, listById);
            renderIndexTape(indexTape, indices);
            renderWalletBars(walletBarChart, gins, currentPrices);
            renderAllocation(allocationDonut, allocationDonutCenter, allocationLegend, indexEntries);
            renderIndexBook(indexBook, indexEntries, currentPrices, ginsById);
            renderHistoricalChart(historyChart, historySummary, historyControls, historicalSeries);
            renderGinCards(marketFloor, gins, currentPrices, listById);
        } catch (error) {
            console.error('Errore nell\'inizializzazione del market desk:', error);
            marketFloor.innerHTML = '<p class="empty-state">Errore nel caricamento del listino in tempo reale.</p>';
        }
    }

    initMarket();
});