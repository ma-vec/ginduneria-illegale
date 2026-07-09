(function () {
    const CONTINENTS = {
        eu: {
            id: "eu",
            name: "Europa",
            short: "EUROPA",
            lat: 54,
            lng: 15,
            color: "#8ea58a",
            subtitle: "Precisione, erbe nobili e salinità misurata",
            cue: "L'Europa tende a privilegiare equilibrio, finezza aromatica e una firma botanica più disciplinata rispetto agli altri continenti.",
            intro: "Qui il gin appare spesso come un esercizio di controllo elegante: ginepro nitido, agrumi dosati, erbe officinali e un gusto per la nitidezza che lascia meno spazio all'opulenza tropicale e più alla costruzione del dettaglio. La lettura europea della categoria resta la più architettonica, con una preferenza per botaniche alpine, costiere o mediterranee e una trama che tende alla precisione più che al volume."
        },
        as: {
            id: "as",
            name: "Asia",
            short: "ASIA",
            lat: 35,
            lng: 95,
            color: "#3d6f7a",
            subtitle: "Minimalismo sensoriale, tè, agrumi e spezie fini",
            cue: "L'Asia lavora spesso per sottrazione: eleganza cerebrale, botaniche luminose e una percezione più contemplativa del distillato.",
            intro: "Molti gin asiatici sembrano costruiti come oggetti da cerimonia: puliti, misurati, quasi meditativi, ma capaci di introdurre spezie, tè, agrumi e legni aromatici con una precisione millimetrica. La filosofia produttiva privilegia l'ordine, la purezza e la cura formale, con meno teatralità e più concentrazione sui contrasti sottili."
        },
        af: {
            id: "af",
            name: "Africa",
            short: "AFRICA",
            lat: 3,
            lng: 22,
            color: "#b69458",
            subtitle: "Botaniche identitarie, paesaggio vivo, calore secco",
            cue: "L'Africa tende a offrire gin territoriali e intensi, spesso costruiti attorno a botaniche autoctone e a un'identità di luogo molto riconoscibile.",
            intro: "Nel continente africano il gin si avvicina spesso al racconto del territorio: botaniche locali, note solari, materia vegetale netta e una relazione più diretta con savane, coste, fynbos o aree montane. Rispetto ad altri continenti, qui emerge con forza l'idea di autenticità geografica e di biodiversità espressa in modo molto concreto."
        },
        am: {
            id: "am",
            name: "Americhe",
            short: "AMERICHE",
            lat: 13,
            lng: -78,
            color: "#a46f55",
            subtitle: "Ampiezza aromatica, foreste, frutti e una vena narrativa più libera",
            cue: "Le Americhe tendono a essere più espansive: gin fruttati, tropicali o boscosi, con una lettura meno lineare e più narrativa.",
            intro: "Dal Nord al Sud America il gin assume spesso un tono più aperto e panoramico: foreste, frutti tropicali, agrumi intensi, spezie vegetali e un rapporto molto diretto con ecosistemi vasti e contrastati. La filosofia produttiva qui è meno disciplinata e più espressiva, con gin che sembrano voler raccontare il paesaggio prima ancora di cercare l'equilibrio classico."
        },
        oc: {
            id: "oc",
            name: "Oceania",
            short: "OCEANIA",
            lat: -22,
            lng: 135,
            color: "#8b7ea3",
            subtitle: "Coste ventose, erbe costiere e leggerezza minerale",
            cue: "L'Oceania privilegia gin ariosi, luminosi e spesso costieri, con un'identità botanica sobria ma molto riconoscibile.",
            intro: "In Oceania il gin si lega spesso a coste, vento, erbe spontanee e una materia aromatica pulita, quasi essenziale. La sua specificità rispetto agli altri continenti è la sensazione di spazio e di respiro: i profili restano leggeri, minerali, freschi e centrati sulla trasparenza più che sulla densità."
        }
    };

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
        idleRotationSpeed: 0,
        selectedRing: null
    };

    const globeRoot = document.getElementById("globe-root");
    const panel = document.getElementById("continent-panel");
    const panelContent = document.getElementById("continent-panel-content");
    const backdrop = document.getElementById("drawer-backdrop");

    if (!globeRoot || !panel || !panelContent || typeof Globe !== "function") {
        return;
    }

    let globe = null;

    function getGinContinent(gin) {
        return gin?.filters?.cont || null;
    }

    function getContinent(continentId) {
        return CONTINENTS[continentId] || null;
    }

    function getContinentColor(continentId) {
        return getContinent(continentId)?.color || "#d6b66c";
    }

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function formatNumber(value, digits = 1) {
        return Number.isFinite(value) ? value.toFixed(digits) : "N/D";
    }

    function renderIntroState() {
        panelContent.innerHTML = "";
        setPanelOpenForMobile(false);
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
            syncGinCardHover(gin.id);
            updateGinPins();
        });

        card.addEventListener("mouseleave", () => {
            if (state.hoveredGinId === gin.id) {
                state.hoveredGinId = null;
                updateGinPins();
            }
            card.classList.remove("is-active");
        });

        return card;
    }

    function createPanelContent(continentId) {
        const continent = getContinent(continentId);
        if (!continent) return document.createElement("div");

        const gins = state.ginList.filter((gin) => getGinContinent(gin) === continentId);
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
        badge.innerHTML = `<span class="stat-chip__label">Gin presenti</span><span class="stat-chip__value">${gins.length}</span>`;

        meta.append(headingWrap, badge);

        const lead = document.createElement("p");
        lead.className = "continent-panel__lead";
        lead.textContent = continent.intro;

        const cue = document.createElement("p");
        cue.className = "continent-panel__lead";
        cue.textContent = continent.cue;

        const listWrap = document.createElement("div");
        listWrap.className = "continent-panel__list-wrap";

        const listTitle = document.createElement("div");
        listTitle.className = "continent-panel__list-title";
        listTitle.innerHTML = `<h3>Gin della collezione</h3><span>${gins.length} schede collegate</span>`;

        const list = document.createElement("div");
        list.className = "continent-panel__list";
        if (gins.length === 0) {
            const empty = document.createElement("p");
            empty.className = "continent-panel__lead";
            empty.textContent = "Nessun gin della collezione è stato collegato a questo continente.";
            list.appendChild(empty);
        } else {
            gins.forEach((gin, index) => list.appendChild(createGinCard(gin, index, continentId)));
        }

        listWrap.append(listTitle, list);
        section.append(meta, lead, cue, listWrap);
        return section;
    }

    function renderPanelForContinent(continentId) {
        panelContent.innerHTML = "";
        panelContent.appendChild(createPanelContent(continentId));
    }

    function setPanelOpenForMobile(isOpen) {
        if (window.matchMedia("(max-width: 760px)").matches) {
            panel.classList.toggle("is-open", isOpen);
            backdrop.hidden = !isOpen;
            backdrop.classList.toggle("is-visible", isOpen);
        }
    }

    function syncGinCardHover(ginId) {
        panelContent.querySelectorAll(".gin-card").forEach((card) => {
            card.classList.toggle("is-active", card.dataset.ginId === ginId);
        });
    }

    function buildPins(continentId) {
        return state.ginList
            .filter((gin) => getGinContinent(gin) === continentId && gin.coordinate)
            .map((gin) => ({
                lat: gin.coordinate.lat,
                lng: gin.coordinate.lon,
                ginId: gin.id,
                name: gin.nome,
                country: gin.provenienza,
                accent: gin["bg-color"] || getContinentColor(continentId),
                isHovered: gin.id === state.hoveredGinId
            }));
    }

    function updateGinPins() {
        if (!globe || !state.selectedContinent) return;
        globe.pointsData(buildPins(state.selectedContinent));
    }

    function getContinentCentroid(continentId) {
        const continent = getContinent(continentId);
        if (!continent) return null;
        return { lat: continent.lat, lng: continent.lng };
    }

    function renderContinentRing(continentId) {
        const continent = getContinent(continentId);
        if (!globe || !continent) return;

        globe.ringsData([{ lat: continent.lat, lng: continent.lng, color: continent.color }]);
    }

    function selectContinent(continentId, options = {}) {
        const continent = getContinent(continentId);
        if (!continent) return;

        state.selectedContinent = continentId;
        state.hoveredContinent = continentId;
        state.hoveredGinId = null;

        renderPanelForContinent(continentId);
        updateLabels();
        updateGinPins();
        renderContinentRing(continentId);
        panel.classList.add("is-open");

        if (globe) {
            const centroid = getContinentCentroid(continentId);
            if (centroid) {
                globe.pointOfView({ lat: centroid.lat, lng: centroid.lng, altitude: 1.8 }, options.duration || 1500);
            }
        }

        setPanelOpenForMobile(true);
        playContinentAudio(continentId);
    }

    function updateLabels() {
        if (!globe) return;
        globe.labelsData(CONTINENTS ? Object.values(CONTINENTS) : []);
    }

    function createGlobe() {
        globe = Globe()(globeRoot)
            .backgroundColor("rgba(0,0,0,0)")
            .globeImageUrl("https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg")
            .bumpImageUrl("https://unpkg.com/three-globe/example/img/earth-topology.png")
            .showGraticules(false)
            .showAtmosphere(true)
            .atmosphereColor("#8ec5f3")
            .atmosphereAltitude(0.22)
            .labelsData(Object.values(CONTINENTS))
            .labelLat((d) => d.lat)
            .labelLng((d) => d.lng)
            .labelText((d) => d.short)
            .labelColor((d) => (d.id === state.hoveredContinent ? "#f6efe0" : d.color))
            .labelSize((d) => (d.id === state.hoveredContinent ? 1.34 : 1.04))
            .labelAltitude((d) => (d.id === state.hoveredContinent ? 0.07 : 0.04))
            .labelIncludeDot(true)
            .labelDotRadius((d) => (d.id === state.hoveredContinent ? 0.22 : 0.14))
            .labelDotOrientation("bottom")
            .labelsTransitionDuration(250)
            .onLabelHover((d) => {
                state.hoveredContinent = d ? d.id : state.selectedContinent;
                updateLabels();
                renderContinentRing(state.hoveredContinent || state.selectedContinent);
            })
            .onLabelClick((d) => selectContinent(d.id, { duration: 1300 }))
            .pointsData([])
            .pointColor((point) => (point.isHovered ? "#f6efe0" : point.accent))
            .pointAltitude((point) => (point.isHovered ? 0.06 : 0.035))
            .pointRadius((point) => (point.isHovered ? 0.22 : 0.16))
            .pointLabel((point) => `${point.name}<br/>${point.country}`)
            .onPointHover((point) => {
                state.hoveredGinId = point ? point.ginId : null;
                syncGinCardHover(point ? point.ginId : null);
                updateGinPins();
            })
            .onPointClick((point) => {
                if (point?.ginId) {
                    window.location.href = `./bottle.html?id=${point.ginId}`;
                }
            })
            .ringsData([])
            .ringColor((ring) => [ring.color, "rgba(255,255,255,0)"])
            .ringMaxRadius(1.8)
            .ringPropagationSpeed(0.7)
            .ringRepeatPeriod(0);

        const controls = globe.controls();
        controls.enablePan = false;
        controls.enableZoom = true;
        controls.enableDamping = true;
        controls.dampingFactor = 0.08;
        controls.minDistance = 180;
        controls.maxDistance = 480;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.14;

        globe.width(globeRoot.clientWidth);
        globe.height(globeRoot.clientHeight);
        globe.pointOfView({ lat: 20, lng: 15, altitude: 2.3 }, 0);

        globeRoot.addEventListener("pointerdown", registerInteraction, { passive: true });
        globeRoot.addEventListener("wheel", registerInteraction, { passive: true });
        globeRoot.addEventListener("touchstart", registerInteraction, { passive: true });
        window.addEventListener("pointermove", registerInteraction, { passive: true });

        requestAnimationFrame(function animate() {
            const elapsed = performance.now() - state.rotationLastInteraction;
            const idleDelay = 1400;
            const idleRamp = 2600;
            const progress = clamp((elapsed - idleDelay) / idleRamp, 0, 1);
            const targetSpeed = 0.14 * progress;
            state.idleRotationSpeed += (targetSpeed - state.idleRotationSpeed) * 0.06;
            controls.autoRotate = state.idleRotationSpeed > 0.003;
            controls.autoRotateSpeed = state.idleRotationSpeed;
            controls.update();
            requestAnimationFrame(animate);
        });

        window.addEventListener("resize", () => {
            globe.width(globeRoot.clientWidth);
            globe.height(globeRoot.clientHeight);
        });
    }

    function playNoise(audioContext, duration, filterFrequency) {
        const bufferSize = Math.max(1, Math.floor(audioContext.sampleRate * duration));
        const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const channel = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i += 1) {
            channel[i] = (Math.random() * 2 - 1) * 0.42;
        }

        const source = audioContext.createBufferSource();
        source.buffer = buffer;

        const filter = audioContext.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = filterFrequency;

        const gain = audioContext.createGain();
        gain.gain.value = 0;

        source.connect(filter);
        filter.connect(gain);
        gain.connect(audioContext.destination);

        const now = audioContext.currentTime;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(1, now + 0.4);
        gain.gain.linearRampToValueAtTime(0.55, now + duration - 0.7);
        gain.gain.linearRampToValueAtTime(0, now + duration);
        source.start(now);
        source.stop(now + duration);
    }

    function playToneLayer(audioContext, layer, duration) {
        const oscillator = audioContext.createOscillator();
        oscillator.type = layer.wave || "sine";
        oscillator.frequency.value = layer.freq;

        const gain = audioContext.createGain();
        gain.gain.value = 0;

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        const now = audioContext.currentTime;
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

    function init() {
        createGlobe();
        bindBackdrop();
        renderIntroState();
    }

    loadGinList()
        .then(() => {
            init();
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