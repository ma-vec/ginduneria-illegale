(function () {
    const CONTINENTS = {
        eu: {
            name: "Europa",
            subtitle: "Precisione, erbe nobili e salinità misurata",
            cue: "L'Europa tende a privilegiare equilibrio, finezza aromatica e una firma botanica più disciplinata rispetto agli altri continenti.",
            intro: "Qui il gin appare spesso come un esercizio di controllo elegante: ginepro nitido, agrumi dosati, erbe officinali e un gusto per la nitidezza che lascia meno spazio all'opulenza tropicale e più alla costruzione del dettaglio. La lettura europea della categoria resta la più architettonica, con una preferenza per botaniche alpine, costiere o mediterranee e una trama che tende alla precisione più che al volume."
        },
        as: {
            name: "Asia",
            subtitle: "Minimalismo sensoriale, tè, agrumi e spezie fini",
            cue: "L'Asia lavora spesso per sottrazione: eleganza cerebrale, botaniche luminose e una percezione più contemplativa del distillato.",
            intro: "Molti gin asiatici sembrano costruiti come oggetti da cerimonia: puliti, misurati, quasi meditativi, ma capaci di introdurre spezie, tè, agrumi e legni aromatici con una precisione millimetrica. La filosofia produttiva privilegia l'ordine, la purezza e la cura formale, con meno teatralità e più concentrazione sui contrasti sottili."
        },
        af: {
            name: "Africa",
            subtitle: "Botaniche identitarie, paesaggio vivo, calore secco",
            cue: "L'Africa tende a offrire gin territoriali e intensi, spesso costruiti attorno a botaniche autoctone e a un'identità di luogo molto riconoscibile.",
            intro: "Nel continente africano il gin si avvicina spesso al racconto del territorio: botaniche locali, note solari, materia vegetale netta e una relazione più diretta con savane, coste, fynbos o aree montane. Rispetto ad altri continenti, qui emerge con forza l'idea di autenticità geografica e di biodiversità espressa in modo molto concreto."
        },
        am: {
            name: "Americhe",
            subtitle: "Ampiezza aromatica, foreste, frutti e una vena narrativa più libera",
            cue: "Le Americhe tendono a essere più espansive: gin fruttati, tropicali o boscosi, con una lettura meno lineare e più narrativa.",
            intro: "Dal Nord al Sud America il gin assume spesso un tono più aperto e panoramico: foreste, frutti tropicali, agrumi intensi, spezie vegetali e un rapporto molto diretto con ecosistemi vasti e contrastati. La filosofia produttiva qui è meno disciplinata e più espressiva, con gin che sembrano voler raccontare il paesaggio prima ancora di cercare l'equilibrio classico."
        },
        oc: {
            name: "Oceania",
            subtitle: "Coste ventose, erbe costiere e leggerezza minerale",
            cue: "L'Oceania privilegia gin ariosi, luminosi e spesso costieri, con un'identità botanica sobria ma molto riconoscibile.",
            intro: "In Oceania il gin si lega spesso a coste, vento, erbe spontanee e una materia aromatica pulita, quasi essenziale. La sua specificità rispetto agli altri continenti è la sensazione di spazio e di respiro: i profili restano leggeri, minerali, freschi e centrati sulla trasparenza più che sulla densità."
        }
    };

    const CONTINENT_POLYGONS = [
        {
            type: "Feature",
            properties: { id: "eu", name: "Europa" },
            geometry: { type: "Polygon", coordinates: [[[-12, 72], [-5, 63], [5, 58], [18, 60], [28, 55], [38, 56], [42, 50], [35, 43], [25, 39], [18, 36], [10, 38], [0, 43], [-4, 50], [-10, 56], [-12, 72]]] }
        },
        {
            type: "Feature",
            properties: { id: "as", name: "Asia" },
            geometry: { type: "Polygon", coordinates: [[ [38, 72], [58, 74], [82, 68], [102, 70], [120, 62], [140, 58], [156, 48], [150, 28], [135, 20], [116, 14], [102, 6], [88, 12], [76, 20], [64, 22], [54, 30], [48, 38], [44, 50], [38, 72] ]] }
        },
        {
            type: "Feature",
            properties: { id: "af", name: "Africa" },
            geometry: { type: "Polygon", coordinates: [[[-18, 38], [-4, 35], [8, 37], [22, 33], [36, 24], [42, 12], [38, -4], [29, -18], [18, -26], [4, -34], [-12, -30], [-18, -16], [-14, 0], [-12, 14], [-16, 26], [-18, 38]]] }
        },
        {
            type: "Feature",
            properties: { id: "am", name: "Americhe" },
            geometry: { type: "Polygon", coordinates: [[[-160, 72], [-144, 66], [-128, 60], [-116, 52], [-108, 42], [-98, 36], [-90, 28], [-82, 20], [-76, 10], [-72, 0], [-70, -10], [-66, -20], [-60, -30], [-56, -44], [-48, -54], [-40, -58], [-30, -54], [-34, -40], [-42, -28], [-50, -16], [-60, -4], [-72, 6], [-82, 18], [-92, 30], [-106, 42], [-124, 52], [-140, 62], [-160, 72]]] }
        },
        {
            type: "Feature",
            properties: { id: "oc", name: "Oceania" },
            geometry: { type: "Polygon", coordinates: [[[110, -8], [122, -6], [136, -10], [150, -18], [154, -28], [146, -38], [132, -44], [120, -40], [112, -30], [108, -18], [110, -8]]] }
        }
    ];

    const AUDIO_PROFILES = {
        eu: { src: null, duration: 7, layers: [{ type: "noise", gain: 0.028, filter: 1100 }, { type: "osc", wave: "sine", freq: 220, gain: 0.012 }, { type: "osc", wave: "triangle", freq: 330, gain: 0.009 }] },
        as: { src: null, duration: 7, layers: [{ type: "noise", gain: 0.024, filter: 900 }, { type: "osc", wave: "sine", freq: 523.25, gain: 0.008 }, { type: "osc", wave: "sine", freq: 392, gain: 0.006 }] },
        af: { src: null, duration: 8, layers: [{ type: "noise", gain: 0.03, filter: 600 }, { type: "osc", wave: "sawtooth", freq: 82.41, gain: 0.007 }, { type: "osc", wave: "triangle", freq: 123.47, gain: 0.006 }] },
        am: { src: null, duration: 8, layers: [{ type: "noise", gain: 0.026, filter: 1200 }, { type: "osc", wave: "sine", freq: 196, gain: 0.01 }, { type: "osc", wave: "triangle", freq: 294, gain: 0.007 }] },
        oc: { src: null, duration: 7, layers: [{ type: "noise", gain: 0.03, filter: 800 }, { type: "osc", wave: "sine", freq: 261.63, gain: 0.007 }, { type: "osc", wave: "sine", freq: 329.63, gain: 0.005 }] }
    };

    const state = {
        ginList: [],
        selectedContinent: null,
        hoveredContinent: null,
        hoveredGinId: null,
        audioContext: null,
        rotationLastInteraction: performance.now(),
        idleRotationSpeed: 0
    };

    const globeRoot = document.getElementById("globe-root");
    const panel = document.getElementById("continent-panel");
    const panelContent = document.getElementById("continent-panel-content");
    const globalStats = document.getElementById("global-stats");
    const emptyStats = document.getElementById("empty-stats");
    const backdrop = document.getElementById("drawer-backdrop");

    if (!globeRoot || !panel || !panelContent || typeof Globe !== "function") {
        return;
    }

    let globe = null;
    let currentPins = [];

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function formatNumber(value, digits = 1) {
        return Number.isFinite(value) ? value.toFixed(digits) : "N/D";
    }

    function parseProvenanceLabel(value) {
        return String(value || "").replace(/^\S+\s*/, "").trim() || "Sconosciuto";
    }

    function getGinContinent(gin) {
        return gin?.filters?.cont || null;
    }

    function getContinentDef(continentId) {
        return CONTINENTS[continentId] || null;
    }

    function getContinentColor(continentId) {
        switch (continentId) {
            case "eu": return getComputedStyle(document.documentElement).getPropertyValue("--eu-color").trim() || "#8ea58a";
            case "as": return getComputedStyle(document.documentElement).getPropertyValue("--as-color").trim() || "#3d6f7a";
            case "af": return getComputedStyle(document.documentElement).getPropertyValue("--af-color").trim() || "#b69458";
            case "am": return getComputedStyle(document.documentElement).getPropertyValue("--am-color").trim() || "#a46f55";
            case "oc": return getComputedStyle(document.documentElement).getPropertyValue("--oc-color").trim() || "#8b7ea3";
            default: return "#8e9296";
        }
    }

    function lightenColor(color, amount) {
        const normalized = color.replace("#", "");
        const value = normalized.length === 3 ? normalized.split("").map((part) => part + part).join("") : normalized;
        const r = parseInt(value.slice(0, 2), 16);
        const g = parseInt(value.slice(2, 4), 16);
        const b = parseInt(value.slice(4, 6), 16);
        const nextR = clamp(Math.round(r + (255 - r) * amount), 0, 255);
        const nextG = clamp(Math.round(g + (255 - g) * amount), 0, 255);
        const nextB = clamp(Math.round(b + (255 - b) * amount), 0, 255);
        return `#${[nextR, nextG, nextB].map((part) => part.toString(16).padStart(2, "0")).join("")}`;
    }

    function hexToRgba(hex, alpha) {
        const normalized = hex.replace("#", "");
        const value = normalized.length === 3 ? normalized.split("").map((part) => part + part).join("") : normalized;
        const r = parseInt(value.slice(0, 2), 16);
        const g = parseInt(value.slice(2, 4), 16);
        const b = parseInt(value.slice(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    function createCanvasTexture() {
        const canvas = document.createElement("canvas");
        canvas.width = 1024;
        canvas.height = 512;
        const context = canvas.getContext("2d");
        if (!context) {
            return canvas.toDataURL();
        }

        const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, "#18232d");
        gradient.addColorStop(0.5, "#101820");
        gradient.addColorStop(1, "#081015");
        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);

        const glow = context.createRadialGradient(360, 180, 20, 360, 180, 280);
        glow.addColorStop(0, "rgba(255,255,255,0.18)");
        glow.addColorStop(0.4, "rgba(160,188,208,0.10)");
        glow.addColorStop(1, "rgba(255,255,255,0)");
        context.fillStyle = glow;
        context.fillRect(0, 0, canvas.width, canvas.height);

        const rim = context.createRadialGradient(650, 310, 120, 650, 310, 360);
        rim.addColorStop(0, "rgba(214,182,108,0.08)");
        rim.addColorStop(1, "rgba(214,182,108,0)");
        context.fillStyle = rim;
        context.fillRect(0, 0, canvas.width, canvas.height);

        return canvas.toDataURL();
    }

    function createStatChip(label, value) {
        const chip = document.createElement("div");
        chip.className = "stat-chip";
        chip.innerHTML = `
            <span class="stat-chip__label">${label}</span>
            <span class="stat-chip__value">${value}</span>
        `;
        return chip;
    }

    function createSummaryStat(label, value) {
        const stat = document.createElement("div");
        stat.className = "continent-panel__stat";
        stat.innerHTML = `
            <span class="continent-panel__stat-label">${label}</span>
            <span class="continent-panel__stat-value">${value}</span>
        `;
        return stat;
    }

    function calcRadarAverage(gins) {
        const values = gins.flatMap((gin) => {
            const radar = gin?.radar;
            if (!radar || typeof radar !== "object") return [];
            const numeric = Object.values(radar).filter((value) => Number.isFinite(Number(value))).map(Number);
            if (!numeric.length) return [];
            return [numeric.reduce((sum, value) => sum + value, 0) / numeric.length];
        });

        if (!values.length) return null;
        return values.reduce((sum, value) => sum + value, 0) / values.length;
    }

    function buildGlobalStats(data) {
        const totalCount = data.length;
        const continentsWithGins = Object.entries(CONTINENTS)
            .map(([id, continent]) => ({ id, name: continent.name, count: data.filter((gin) => getGinContinent(gin) === id).length }))
            .filter((entry) => entry.count > 0)
            .sort((a, b) => b.count - a.count);
        const strongestContinent = continentsWithGins[0] || { name: "N/D", count: 0 };
        const averageAlc = data.filter((gin) => Number.isFinite(Number(gin.alc))).map((gin) => Number(gin.alc));
        const avgAlc = averageAlc.length ? averageAlc.reduce((sum, value) => sum + value, 0) / averageAlc.length : null;
        const radarAverage = calcRadarAverage(data);

        globalStats.innerHTML = "";
        globalStats.append(
            createStatChip("Gin in collezione", String(totalCount)),
            createStatChip("Continente più popolato", `${strongestContinent.name} · ${strongestContinent.count}`),
            createStatChip("Gradazione media", avgAlc !== null ? `${formatNumber(avgAlc, 1)}% vol` : "N/D"),
            createStatChip("Radar medio", radarAverage !== null ? formatNumber(radarAverage, 1) : "N/D")
        );

        emptyStats.innerHTML = "";
        emptyStats.append(
            createStatChip("Coordinate note", `${data.filter((gin) => gin?.coordinate).length}`),
            createStatChip("Schede con radar", `${data.filter((gin) => gin?.radar).length}`)
        );
    }

    function calcCountryStats(gins) {
        const countryCounts = new Map();
        gins.forEach((gin) => {
            const country = parseProvenanceLabel(gin.provenienza);
            countryCounts.set(country, (countryCounts.get(country) || 0) + 1);
        });

        const sorted = Array.from(countryCounts.entries()).sort((a, b) => b[1] - a[1]);
        const [topCountry, topCountryCount] = sorted[0] || ["N/D", 0];
        const avgAlcValues = gins.filter((gin) => Number.isFinite(Number(gin.alc))).map((gin) => Number(gin.alc));
        const avgAlc = avgAlcValues.length ? avgAlcValues.reduce((sum, value) => sum + value, 0) / avgAlcValues.length : null;
        const radarAverage = calcRadarAverage(gins);
        const botanicsAverage = gins.length ? gins.reduce((sum, gin) => sum + (Array.isArray(gin.botaniche) ? gin.botaniche.length : 0), 0) / gins.length : null;

        return { topCountry, topCountryCount, avgAlc, radarAverage, botanicsAverage };
    }

    function createGinCard(gin, index, continentId) {
        const card = document.createElement("a");
        card.className = "gin-card";
        card.href = `./bottle.html?id=${gin.id}`;
        card.dataset.ginId = gin.id;
        card.dataset.continentId = continentId;
        card.style.setProperty("--delay", `${index * 65}ms`);
        card.style.setProperty("--accent", gin["bg-color"] || "#d6b66c");

        const media = document.createElement("div");
        media.className = "gin-card__media";
        const image = document.createElement("img");
        image.className = "gin-card__image";
        image.loading = "lazy";
        image.src = `./assets/images/${gin.id}.png`;
        image.alt = `Bottiglia ${gin.nome}`;
        image.addEventListener("error", () => {
            image.classList.add("is-missing");
        });
        media.appendChild(image);

        const body = document.createElement("div");
        body.className = "gin-card__body";
        const country = document.createElement("span");
        country.className = "gin-card__country";
        country.textContent = gin.provenienza;
        const name = document.createElement("h4");
        name.className = "gin-card__name";
        name.textContent = gin.nome;
        const meta = document.createElement("p");
        meta.className = "gin-card__meta";
        meta.textContent = Array.isArray(gin.botaniche) ? gin.botaniche.slice(0, 2).join(" · ") : "Scheda collegata alla collezione";
        body.append(country, name, meta);

        const action = document.createElement("span");
        action.className = "gin-card__action";
        action.setAttribute("aria-hidden", "true");
        action.textContent = "↗";

        card.append(media, body, action);

        card.addEventListener("mouseenter", () => {
            state.hoveredGinId = gin.id;
            updatePinsForCurrentState();
            card.classList.add("is-active");
        });

        card.addEventListener("mouseleave", () => {
            if (state.hoveredGinId === gin.id) {
                state.hoveredGinId = null;
                updatePinsForCurrentState();
            }
            card.classList.remove("is-active");
        });

        return card;
    }

    function buildPinData(gins, activeContinentId, hoverGinId = null) {
        return gins.filter((gin) => getGinContinent(gin) === activeContinentId).map((gin) => ({
            lat: gin.coordinate.lat,
            lng: gin.coordinate.lon,
            ginId: gin.id,
            name: gin.nome,
            country: gin.provenienza,
            accent: gin["bg-color"] || "#d6b66c",
            isHovered: gin.id === hoverGinId
        }));
    }

    function renderPinState(continentId) {
        if (!globe) return;
        currentPins = buildPinData(state.ginList, continentId, state.hoveredGinId);
        globe.pointsData(currentPins);
        globe.pointColor((point) => (point.isHovered ? "#f1e0b0" : point.accent));
        globe.pointAltitude((point) => (point.isHovered ? 0.055 : 0.036));
        globe.pointRadius((point) => (point.isHovered ? 0.22 : 0.16));
        globe.pointLabel((point) => `${point.name}<br/>${point.country}`);
    }

    function updatePinsForCurrentState() {
        if (!state.selectedContinent) return;
        renderPinState(state.selectedContinent);
    }

    function renderPolygons() {
        if (!globe) return;
        globe.polygonsData(CONTINENT_POLYGONS);
    }

    function syncGinCardHover(ginId) {
        panelContent.querySelectorAll(".gin-card").forEach((card) => {
            card.classList.toggle("is-active", card.dataset.ginId === ginId);
        });
    }

    function getContinentCentroid(continentId) {
        const points = CONTINENT_POLYGONS.find((feature) => feature.properties.id === continentId)?.geometry?.coordinates?.[0] || [];
        if (!points.length) return null;

        const average = points.reduce((accumulator, point) => {
            accumulator.lat += point[1];
            accumulator.lng += point[0];
            return accumulator;
        }, { lat: 0, lng: 0 });

        return { lat: average.lat / points.length, lng: average.lng / points.length };
    }

    function setPanelOpenForMobile(isOpen) {
        if (window.matchMedia("(max-width: 760px)").matches) {
            panel.classList.toggle("is-open", isOpen);
            backdrop.hidden = !isOpen;
            backdrop.classList.toggle("is-visible", isOpen);
        }
    }

    function createPanelContent(continentId) {
        const continent = getContinentDef(continentId);
        const gins = state.ginList.filter((gin) => getGinContinent(gin) === continentId);
        const stats = calcCountryStats(gins);
        const activeCount = gins.length;

        const section = document.createElement("div");
        section.className = "continent-panel__section";

        const meta = document.createElement("div");
        meta.className = "continent-panel__meta";

        const headingWrap = document.createElement("div");
        const heading = document.createElement("h2");
        heading.className = "continent-panel__heading";
        heading.textContent = continent.name;
        const subtitle = document.createElement("p");
        subtitle.className = "continent-panel__subtitle";
        subtitle.textContent = continent.subtitle;
        headingWrap.append(heading, subtitle);

        const badge = document.createElement("div");
        badge.className = "stat-chip";
        badge.innerHTML = `
            <span class="stat-chip__label">Gin presenti</span>
            <span class="stat-chip__value">${activeCount}</span>
        `;
        meta.append(headingWrap, badge);

        const lead = document.createElement("p");
        lead.className = "continent-panel__lead";
        lead.textContent = continent.intro;

        const cue = document.createElement("p");
        cue.className = "continent-panel__lead";
        cue.textContent = continent.cue;

        const summary = document.createElement("div");
        summary.className = "continent-panel__summary";
        summary.append(
            createSummaryStat("Paese più rappresentato", `${stats.topCountry} · ${stats.topCountryCount}`),
            createSummaryStat("Gradazione media", stats.avgAlc !== null ? `${formatNumber(stats.avgAlc, 1)}% vol` : "N/D"),
            createSummaryStat("Radar medio", stats.radarAverage !== null ? formatNumber(stats.radarAverage, 1) : "N/D"),
            createSummaryStat("Botaniche medie", stats.botanicsAverage !== null ? formatNumber(stats.botanicsAverage, 1) : "N/D")
        );

        const listWrap = document.createElement("div");
        listWrap.className = "continent-panel__list-wrap";
        const listTitle = document.createElement("div");
        listTitle.className = "continent-panel__list-title";
        listTitle.innerHTML = `
            <h3>Gin della collezione</h3>
            <span>${activeCount} schede collegate</span>
        `;

        const list = document.createElement("div");
        list.className = "continent-panel__list";
        if (gins.length === 0) {
            const empty = document.createElement("p");
            empty.className = "continent-panel__lead";
            empty.textContent = "Nessun gin della collezione è stato collegato a questo continente.";
            list.appendChild(empty);
        } else {
            gins.forEach((gin, index) => {
                list.appendChild(createGinCard(gin, index, continentId));
            });
        }

        listWrap.append(listTitle, list);
        section.append(meta, lead, cue, summary, listWrap);
        return section;
    }

    function renderIntroState() {
        panelContent.innerHTML = "";
        const intro = document.createElement("div");
        intro.className = "continent-panel__empty";
        intro.innerHTML = `
            <p class="continent-panel__eyebrow">Seleziona un continente</p>
            <h2>Un atlante da esplorare</h2>
            <p>Tocca o clicca una delle cinque aree del globo per aprire il racconto editoriale, le statistiche automatiche e la lista dei gin associati.</p>
        `;
        const clone = emptyStats.cloneNode(true);
        intro.appendChild(clone);
        panelContent.appendChild(intro);
        setPanelOpenForMobile(false);
    }

    function selectContinent(continentId, options = {}) {
        const continent = getContinentDef(continentId);
        if (!continent) return;

        state.selectedContinent = continentId;
        state.hoveredContinent = continentId;
        state.hoveredGinId = null;

        panelContent.innerHTML = "";
        panelContent.appendChild(createPanelContent(continentId));

        if (globe) {
            const centroid = getContinentCentroid(continentId);
            if (centroid) {
                globe.pointOfView({ lat: centroid.lat, lng: centroid.lng, altitude: 1.8 }, options.duration || 1600);
            }
        }

        renderPinState(continentId);
        renderPolygons();
        setPanelOpenForMobile(true);
        playContinentAudio(continentId);
    }

    function createGlobe() {
        const textureUrl = createCanvasTexture();
        globe = Globe()(globeRoot)
            .backgroundColor("rgba(0,0,0,0)")
            .globeImageUrl(textureUrl)
            .showAtmosphere(true)
            .atmosphereColor("#c6d3dd")
            .atmosphereAltitude(0.24)
            .polygonsData(CONTINENT_POLYGONS)
            .polygonCapColor((feature) => {
                const id = feature.properties.id;
                const baseColor = getContinentColor(id);
                const hoverBoost = state.hoveredContinent === id ? 0.14 : 0.06;
                return lightenColor(baseColor, hoverBoost);
            })
            .polygonSideColor((feature) => {
                const id = feature.properties.id;
                return lightenColor(getContinentColor(id), state.hoveredContinent === id ? 0.06 : 0.03);
            })
            .polygonStrokeColor(() => null)
            .polygonAltitude((feature) => (state.hoveredContinent === feature.properties.id ? 0.05 : 0.034))
            .polygonsTransitionDuration(360)
            .onPolygonHover((feature) => {
                state.hoveredContinent = feature ? feature.properties.id : state.selectedContinent;
                renderPolygons();
            })
            .onPolygonClick((feature) => {
                selectContinent(feature.properties.id, { duration: 1300 });
            })
            .pointsData([])
            .pointColor((point) => (point.isHovered ? "#f1e0b0" : point.accent))
            .pointAltitude((point) => (point.isHovered ? 0.055 : 0.036))
            .pointRadius((point) => (point.isHovered ? 0.22 : 0.16))
            .pointLabel((point) => `${point.name}<br/>${point.country}`)
            .onPointHover((point) => {
                state.hoveredGinId = point ? point.ginId : null;
                updatePinsForCurrentState();
                syncGinCardHover(point ? point.ginId : null);
            })
            .onPointClick((point) => {
                if (point?.ginId) {
                    window.location.href = `./bottle.html?id=${point.ginId}`;
                }
            });

        const controls = globe.controls();
        controls.enablePan = false;
        controls.enableZoom = true;
        controls.enableDamping = true;
        controls.dampingFactor = 0.08;
        controls.minDistance = 180;
        controls.maxDistance = 480;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.16;

        globe.width(globeRoot.clientWidth);
        globe.height(globeRoot.clientHeight);
        globe.pointOfView({ lat: 20, lng: 10, altitude: 2.35 }, 0);

        globeRoot.addEventListener("pointerdown", registerInteraction, { passive: true });
        globeRoot.addEventListener("wheel", registerInteraction, { passive: true });
        globeRoot.addEventListener("touchstart", registerInteraction, { passive: true });
        window.addEventListener("pointermove", registerInteraction, { passive: true });

        requestAnimationFrame(function tick() {
            const elapsed = performance.now() - state.rotationLastInteraction;
            const idleDelay = 1400;
            const idleRamp = 2600;
            const progress = clamp((elapsed - idleDelay) / idleRamp, 0, 1);
            const targetSpeed = 0.16 * progress;

            state.idleRotationSpeed += (targetSpeed - state.idleRotationSpeed) * 0.06;
            controls.autoRotate = state.idleRotationSpeed > 0.003;
            controls.autoRotateSpeed = state.idleRotationSpeed;
            controls.update();
            requestAnimationFrame(tick);
        });

        window.addEventListener("resize", () => {
            globe.width(globeRoot.clientWidth);
            globe.height(globeRoot.clientHeight);
        });
    }

    function playNoise(bufferContext, duration, filterFrequency) {
        const bufferSize = Math.max(1, Math.floor(bufferContext.sampleRate * duration));
        const buffer = bufferContext.createBuffer(1, bufferSize, bufferContext.sampleRate);
        const channel = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i += 1) {
            channel[i] = (Math.random() * 2 - 1) * 0.42;
        }

        const source = bufferContext.createBufferSource();
        source.buffer = buffer;

        const filter = bufferContext.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = filterFrequency;

        const gain = bufferContext.createGain();
        gain.gain.value = 0;

        source.connect(filter);
        filter.connect(gain);
        gain.connect(bufferContext.destination);

        const now = bufferContext.currentTime;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(1, now + 0.4);
        gain.gain.linearRampToValueAtTime(0.55, now + duration - 0.7);
        gain.gain.linearRampToValueAtTime(0, now + duration);
        source.start(now);
        source.stop(now + duration);
    }

    function playToneLayer(bufferContext, layer, duration) {
        const oscillator = bufferContext.createOscillator();
        oscillator.type = layer.wave || "sine";
        oscillator.frequency.value = layer.freq;

        const gain = bufferContext.createGain();
        gain.gain.value = 0;

        oscillator.connect(gain);
        gain.connect(bufferContext.destination);

        const now = bufferContext.currentTime;
        const attack = 0.5;
        const release = 1.1;

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(layer.gain, now + attack);
        gain.gain.linearRampToValueAtTime(layer.gain * 0.8, now + duration - release);
        gain.gain.linearRampToValueAtTime(0, now + duration);
        oscillator.start(now);
        oscillator.stop(now + duration);
    }

    function playContinentAudio(continentId) {
        const profile = AUDIO_PROFILES[continentId];
        if (!profile) return;

        if (!state.audioContext) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass) return;
            state.audioContext = new AudioContextClass();
        }

        if (state.audioContext.state === "suspended") {
            state.audioContext.resume().catch(() => {});
        }

        if (profile.src) {
            const audio = new Audio(profile.src);
            audio.volume = 0.16;
            audio.play().catch(() => {
                playNoise(state.audioContext, profile.duration, profile.layers[0].filter);
                profile.layers.slice(1).forEach((layer) => playToneLayer(state.audioContext, layer, profile.duration));
            });
            return;
        }

        playNoise(state.audioContext, profile.duration, profile.layers[0].filter);
        profile.layers.slice(1).forEach((layer) => playToneLayer(state.audioContext, layer, profile.duration));
    }

    function registerInteraction() {
        state.rotationLastInteraction = performance.now();
    }

    function bindBackdrop() {
        backdrop.addEventListener("click", () => {
            panel.classList.remove("is-open");
            backdrop.classList.remove("is-visible");
            backdrop.hidden = true;
        });
    }

    function loadGinList() {
        return fetch("./data/gin_list.json")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Impossibile caricare gin_list.json");
                }
                return response.json();
            })
            .then((data) => {
                state.ginList = Array.isArray(data) ? data : [];
            });
    }

    function initFallbackSelection() {
        renderIntroState();
    }

    loadGinList()
        .then(() => {
            buildGlobalStats(state.ginList);
            createGlobe();
            bindBackdrop();
            renderIntroState();
        })
        .catch((error) => {
            console.error(error);
            panelContent.innerHTML = `
                <div class="continent-panel__empty">
                    <p class="continent-panel__eyebrow">Errore dati</p>
                    <h2>Impossibile caricare il Mondo dei Gin</h2>
                    <p>Controlla che <strong>data/gin_list.json</strong> sia disponibile e che il browser consenta il fetch locale.</p>
                </div>
            `;
        });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && window.matchMedia("(max-width: 760px)").matches) {
            panel.classList.remove("is-open");
            backdrop.classList.remove("is-visible");
            backdrop.hidden = true;
        }
    });

    window.addEventListener("resize", () => {
        if (!window.matchMedia("(max-width: 760px)").matches) {
            backdrop.hidden = true;
            backdrop.classList.remove("is-visible");
        }
    });
})();