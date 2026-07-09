(function() {
    const container = document.getElementById("container");
    const hero = document.getElementById("hero");
    const catalogSection = document.getElementById("catalog-section");
    const catalogGrid = document.getElementById("catalog-grid");
    const viewButtons = Array.from(document.querySelectorAll(".view-toggle__button"));

    let scrollAccumulator = 0;
    let heroComplete = false;
    let ticking = false;
    let activeView = "list";
    let ginData = [];
    let ginDataPromise = null;
    let videoSectionsCreated = false;
    let ginVideos = [];
    const filterDefinitions = [
        {
            id: "provenienza",
            title: "Provenienza",
            options: [
                { value: "eu", label: "Europa" },
                { value: "as", label: "Asia" },
                { value: "am", label: "Americhe" },
                { value: "af", label: "Africa" },
                { value: "oc", label: "Oceania" }
            ]
        },
        {
            id: "profilo",
            title: "Profilo gustativo",
            options: [
                { value: "dryness", label: "Secco" },
                { value: "uniqueness", label: "Inedito" },
                { value: "balsamic", label: "Balsamico" },
                { value: "salinity", label: "Sapido" },
                { value: "citrus", label: "Agrumato" },
                { value: "botanic-complexity", label: "Botanico" },
                { value: "persistence", label: "Persistente" }
            ]
        },
        {
            id: "tonica",
            title: "Tonica",
            options: [
                { value: "indiana", label: "Indiana" },
                { value: "mediterranea", label: "Mediterranea" }
            ]
        },
        {
            id: "ecosistema",
            title: "Ecosistema",
            options: [
                { value: "mar", label: "🌊 Marittimo" },
                { value: "med", label: "🌿 Mediterraneo" },
                { value: "bos", label: "🌲 Boschivo" },
                { value: "mon", label: "⛰️ Montano" },
                { value: "bor", label: "❄️ Boreale" },
                { value: "sel", label: "🌍 Selvaggio" },
                { value: "tro", label: "🌸 Tropicale" }
            ]
        },
        {
            id: "sostenibilita",
            title: "Sostenibilità",
            options: [
                { value: "ethical", label: "Elevato rating etico" },
                { value: "botanicals-ter", label: "Botaniche del territorio" },
                { value: "ong", label: "Sostiene ONG" }
            ]
        },
        {
            id: "altro",
            title: "Altro",
            options: [
                { value: "available", label: "Bottiglia disponibile" },
                { value: "limited", label: "Limited edition" }
            ]
        }
    ];
    const filterState = {
        provenienza: new Set(),
        profilo: new Set(),
        tonica: new Set(),
        ecosistema: new Set(),
        sostenibilita: new Set(),
        altro: new Set()
    };
    const filterCheckboxes = new Map();
    let filterPanel = null;
    let filterBackdrop = null;
    let filterSummary = null;
    let filterResults = null;
    let filterCount = null;
    let filterClearButton = null;
    let filterButton = null;
    let filtersPanelOpen = false;
    const heroEnabled = Boolean(hero && text2 && text3 && ctaText && progressBar);

    function getPrimaryScrollTarget() {
        if (activeView === "video") {
            return document.querySelector(".terroir");
        }

        return catalogSection;
    }

    function pauseVideos() {
        ginVideos.forEach((video) => {
            video.pause();
        });
    }

    function getFilterCount() {
        return Object.values(filterState).reduce((total, selection) => total + selection.size, 0);
    }

    function closeFilterPanel() {
        if (!filterPanel) return;

        filtersPanelOpen = false;
        document.body.classList.remove("filters-open");
        filterPanel.classList.remove("is-open");
        filterPanel.setAttribute("aria-hidden", "true");
        if (filterBackdrop) {
            filterBackdrop.classList.remove("is-visible");
        }
        updateToggleState();
    }

    function openFilterPanel() {
        if (!filterPanel) return;

        filtersPanelOpen = true;
        document.body.classList.add("filters-open");
        filterPanel.classList.add("is-open");
        filterPanel.setAttribute("aria-hidden", "false");
        if (filterBackdrop) {
            filterBackdrop.classList.add("is-visible");
        }
        updateToggleState();
    }

    function toggleFilterPanel() {
        if (filtersPanelOpen) {
            closeFilterPanel();
            return;
        }

        if (activeView !== "list") {
            setView("list", { scrollToTarget: false });
        }

        openFilterPanel();
    }

    function updateFilterButtonState() {
        if (!filterButton) return;

        filterButton.classList.toggle("is-active", filtersPanelOpen);
        filterButton.setAttribute("aria-pressed", String(filtersPanelOpen));
        filterButton.setAttribute("aria-expanded", String(filtersPanelOpen));
    }

    function updateToggleState() {
        viewButtons.forEach((button) => {
            if (button.dataset.view === "filter") {
                return;
            }

            const isActive = button.dataset.view === activeView;
            button.classList.toggle("is-active", isActive);
            button.setAttribute("aria-pressed", String(isActive));
        });

        updateFilterButtonState();
    }

    function setView(view, options = {}) {
        const { scrollToTarget = true } = options;
        activeView = view;

        document.body.classList.toggle("mode-video", view === "video");
        document.body.classList.toggle("mode-list", view !== "video");

        if (view === "video" && filtersPanelOpen) {
            closeFilterPanel();
        }

        updateToggleState();

        if (view === "video") {
            ensureVideoSections().then(() => {
                if (scrollToTarget) {
                    scrollToPrimaryTarget();
                }
            });
        } else {
            pauseVideos();
            if (scrollToTarget) {
                scrollToPrimaryTarget();
            }
        }
    }

    function createFilterControl(definition, option) {
        const optionId = `filter-${definition.id}-${option.value}`;
        const label = document.createElement("label");
        label.className = "filters-panel__option";
        label.htmlFor = optionId;

        const input = document.createElement("input");
        input.type = "checkbox";
        input.id = optionId;
        input.dataset.filterGroup = definition.id;
        input.dataset.filterValue = option.value;

        const text = document.createElement("span");
        text.textContent = option.label;

        label.appendChild(input);
        label.appendChild(text);

        filterCheckboxes.set(optionId, input);

        return label;
    }

    function createFilterSection(definition) {
        const section = document.createElement("section");
        section.className = "filters-panel__section";
        section.classList.add("is-collapsed");
        section.dataset.sectionId = definition.id;

        const header = document.createElement("button");
        header.type = "button";
        header.className = "filters-panel__section-toggle";
        header.setAttribute("aria-expanded", "false");
        header.innerHTML = `
            <strong>${definition.title}</strong>
            <span class="filters-panel__chevron" aria-hidden="true"></span>
        `;

        const body = document.createElement("div");
        body.className = "filters-panel__section-body";

        definition.options.forEach((option) => {
            body.appendChild(createFilterControl(definition, option));
        });

        header.addEventListener("click", () => {
            const isCollapsed = section.classList.contains("is-collapsed");

            if (isCollapsed) {
                document.querySelectorAll(".filters-panel__section.is-collapsed").forEach((otherSection) => {
                    if (otherSection !== section) {
                        otherSection.classList.add("is-collapsed");
                        const otherHeader = otherSection.querySelector(".filters-panel__section-toggle");
                        if (otherHeader) {
                            otherHeader.setAttribute("aria-expanded", "false");
                        }
                    }
                });
            }

            section.classList.toggle("is-collapsed");
            header.setAttribute("aria-expanded", String(section.classList.contains("is-collapsed") ? false : true));
        });

        section.appendChild(header);
        section.appendChild(body);
        return section;
    }

    function syncFilterInputs() {
        filterCheckboxes.forEach((input) => {
            const group = input.dataset.filterGroup;
            const value = input.dataset.filterValue;
            input.checked = filterState[group]?.has(value) || false;
        });
    }

    function setFilterState(group, value, isChecked) {
        const targetSet = filterState[group];

        if (!targetSet) return;

        if (isChecked) {
            targetSet.add(value);
        } else {
            targetSet.delete(value);
        }
    }

    function updateFilterSummary(dataLength = 0) {
        const activeCount = getFilterCount();
        const label = activeCount === 0 ? "Nessun filtro attivo" : `${activeCount} filtri attivi`;

        if (filterCount) {
            filterCount.textContent = label;
        }

        if (filterSummary) {
            filterSummary.textContent = label;
        }

        if (filterResults) {
            filterResults.textContent = `${dataLength} bottiglie in vista`;
        }

        if (filterClearButton) {
            filterClearButton.disabled = activeCount === 0;
        }
    }

    function renderFilterPanel() {
        if (filterPanel) return;

        filterBackdrop = document.createElement("button");
        filterBackdrop.type = "button";
        filterBackdrop.className = "filters-backdrop";
        filterBackdrop.setAttribute("aria-label", "Chiudi filtri");

        filterPanel = document.createElement("aside");
        filterPanel.className = "filters-panel";
        filterPanel.setAttribute("aria-hidden", "true");
        filterPanel.setAttribute("aria-label", "Filtri bottiglie");

        const header = document.createElement("header");
        header.className = "filters-panel__header";
        header.innerHTML = `
            <div>
                <p class="filters-panel__eyebrow">Refine the library</p>
                <h3>Filtri</h3>
            </div>
        `;

        const closeButton = document.createElement("button");
        closeButton.type = "button";
        closeButton.className = "filters-panel__close";
        closeButton.setAttribute("aria-label", "Chiudi filtri");
        closeButton.textContent = "×";
        header.appendChild(closeButton);

        const summary = document.createElement("p");
        summary.className = "filters-panel__summary";
        summary.textContent = "Nessun filtro attivo";

        const sections = document.createElement("div");
        sections.className = "filters-panel__sections";

        filterDefinitions.forEach((definition) => {
            sections.appendChild(createFilterSection(definition));
        });

        const footer = document.createElement("footer");
        footer.className = "filters-panel__footer";

        const results = document.createElement("p");
        results.className = "filters-panel__results";
        results.textContent = "0 bottiglie in vista";

        const clearButton = document.createElement("button");
        clearButton.type = "button";
        clearButton.className = "filters-panel__clear";
        clearButton.textContent = "Azzera filtri";

        footer.appendChild(results);
        footer.appendChild(clearButton);

        filterPanel.appendChild(header);
        filterPanel.appendChild(summary);
        filterPanel.appendChild(sections);
        filterPanel.appendChild(footer);

        filterSummary = summary;
        filterResults = results;
        filterCount = summary;
        filterClearButton = clearButton;

        closeButton.addEventListener("click", closeFilterPanel);
        filterBackdrop.addEventListener("click", closeFilterPanel);

        clearButton.addEventListener("click", () => {
            Object.values(filterState).forEach((selection) => selection.clear());
            syncFilterInputs();
            renderCatalog(ginData);
        });

        filterPanel.addEventListener("change", (event) => {
            const target = event.target;

            if (!(target instanceof HTMLInputElement) || target.type !== "checkbox") {
                return;
            }

            const group = target.dataset.filterGroup;
            const value = target.dataset.filterValue;

            if (!group || !value) {
                return;
            }

            setFilterState(group, value, target.checked);
            renderCatalog(ginData);
        });

        document.body.appendChild(filterBackdrop);
        document.body.appendChild(filterPanel);
    }

    function ginMatchesFilter(definitionId, gin) {
        switch (definitionId) {
            case "provenienza": {
                if (!filterState.provenienza.size) return true;
                return filterState.provenienza.has(gin?.filters?.cont);
            }
            case "profilo": {
                if (!filterState.profilo.size) return true;
                return Array.from(filterState.profilo).every((key) => Number(gin?.radar?.[key]) > 7);
            }
            case "tonica": {
                if (!filterState.tonica.size) return true;
                return (gin?.toniche || []).some((tonica) => {
                    if (!filterState.tonica.has(tonica?.tipo)) {
                        return false;
                    }

                    return tonica?.consigliata === true;
                });
            }
            case "ecosistema": {
                if (!filterState.ecosistema.size) return true;
                const ecosistemi = Array.isArray(gin?.filters?.ecosistema) ? gin.filters.ecosistema : [];
                return ecosistemi.some((ecosistema) => filterState.ecosistema.has(ecosistema));
            }
            case "sostenibilita": {
                if (!filterState.sostenibilita.size) return true;

                return Array.from(filterState.sostenibilita).every((value) => {
                    if (value === "ethical") {
                        return Number(gin?.ethicalIndex?.tot) > 84;
                    }

                    if (value === "botanicals-ter") {
                        return gin?.filters?.["botanicals-ter"] === true;
                    }

                    if (value === "ong") {
                        return gin?.filters?.ong === true;
                    }

                    return false;
                });
            }
            case "altro": {
                if (!filterState.altro.size) return true;

                return Array.from(filterState.altro).every((value) => {
                    if (value === "available") {
                        return gin?.isEmpty === false;
                    }

                    if (value === "limited") {
                        return typeof gin?.limited === "string" && gin.limited.trim().length > 0;
                    }

                    return false;
                });
            }
            default:
                return true;
        }
    }

    function filterGins(data) {
        const definitionIds = filterDefinitions.map((definition) => definition.id);

        return data.filter((gin) => definitionIds.every((definitionId) => ginMatchesFilter(definitionId, gin)));
    }

    function scrollToPrimaryTarget() {
        const target = getPrimaryScrollTarget();
        if (!target) return;

        container.scrollTo({
            top: target.offsetTop,
            behavior: "smooth"
        });
    }

    async function loadGinList() {
        if (ginData.length) {
            return ginData;
        }

        if (ginDataPromise) {
            return ginDataPromise;
        }

        ginDataPromise = fetch("./data/gin_list.json")
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                return response.json();
            })
            .then((data) => {
                ginData = data;
                return data;
            });

        return ginDataPromise;
    }

    function createBottleCard(gin, index) {
        const card = document.createElement("article");
        card.className = "catalog-card";
        card.style.setProperty("--card-delay", `${index * 80}ms`);
        card.style.setProperty("--gin-color", gin["bg-color"] || "#D4AF37");

        const imageWrap = document.createElement("div");
        imageWrap.className = "catalog-card__image-wrap";

        const image = document.createElement("img");
        image.className = "catalog-card__image";
        image.loading = "lazy";
        image.src = `./assets/images/${gin.id}.png`;
        image.alt = `Bottiglia ${gin.nome}`;
        image.addEventListener("error", () => {
            image.classList.add("is-missing");
        });

        const imageGlow = document.createElement("div");
        imageGlow.className = "catalog-card__glow";

        imageWrap.appendChild(imageGlow);
        imageWrap.appendChild(image);

        const body = document.createElement("div");
        body.className = "catalog-card__body";

        const topRow = document.createElement("div");
        topRow.className = "catalog-card__top-row";

        const topMeta = document.createElement("div");
        topMeta.className = "catalog-card__top-meta";
        if (gin.isEmpty === true) {
            topMeta.textContent = "ESAURITO";
        } else {
            topMeta.textContent = (gin.aggettivi || []).slice(0, 2).join(" · ");
        }

        const name = document.createElement("h3");
        name.textContent = gin.nome;

        const provenance = document.createElement("p");
        provenance.className = "catalog-card__provenance";
        provenance.textContent = gin.provenienza;

        topRow.appendChild(topMeta);
        topRow.appendChild(name);
        topRow.appendChild(provenance);

        const botanics = document.createElement("div");
        botanics.className = "catalog-card__botanics";

        (gin.botaniche || []).slice(0, 3).forEach((item) => {
            const chip = document.createElement("span");
            chip.className = "catalog-chip";
            chip.textContent = item;
            botanics.appendChild(chip);
        });

        const footer = document.createElement("div");
        footer.className = "catalog-card__footer";

        const link = document.createElement("a");
        link.className = "catalog-card__link";
        link.href = `./bottle.html?id=${gin.id}`;
        link.textContent = "Apri bottiglia";

        const hasLimited = typeof gin.limited === "string" && gin.limited.trim().length > 0;

        let meta = null;
        if (hasLimited) {
            meta = document.createElement("div");
            meta.className = "catalog-card__meta";
            meta.textContent = gin.limited;
        } else {
            footer.classList.add("catalog-card__footer--no-meta");
        }

        if (meta) {
            footer.appendChild(meta);
        }
        footer.appendChild(link);

        link.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (card.classList.contains("is-opening")) {
                return;
            }

            sessionStorage.setItem("homePreviewGin", gin.id);
            playBottlePreview(gin, card);
        });

        body.appendChild(topRow);
        body.appendChild(botanics);
        body.appendChild(footer);

        card.appendChild(imageWrap);
        card.appendChild(body);

        return card;
    }

    function createPreviewDecorationLayer(gin) {
        const layer = document.createElement("div");
        layer.className = "catalog-preview__decorations";

        const theme = getDecorationTheme(gin);
        const decorations = createThemedDecorations(theme);

        decorations.forEach((decoration, index) => {
            decoration.style.animationDelay = `${index * 80}ms`;
            layer.appendChild(decoration);
        });

        return layer;
    }

    function getDecorationTheme(gin) {
        switch (gin.id) {
            case "poseidon":
            case "portofino-winter":
                return "sea";
            case "xoriguer":
                return "olive";
            case "melagorai":
                return "orchard";
            case "amuerte-white":
                return "confetti";
            case "bareksten-botanical":
            case "son-of-a-birch":
                return "botanical";
            case "rupis":
                return "coastal";
            case "gordon":
                return "herbal";
            case "sipsmith":
                return "spa";
            case "castelgy":
                return "floral";
            case "malfy-rosa":
                return "citrus";
            default:
                return "minimal";
        }
    }

    function createThemedDecorations(theme) {
        const decorations = [];

        const decorator = {
            botanical: () => {
                const stem1 = document.createElement("div");
                stem1.className = "catalog-preview__decoration catalog-preview__decoration--stem";
                stem1.style.top = "20%";
                stem1.style.left = "38%";
                stem1.style.width = "6px";
                stem1.style.height = "140px";

                const leaf1 = document.createElement("div");
                leaf1.className = "catalog-preview__decoration catalog-preview__decoration--botanical-leaf";
                leaf1.style.top = "30%";
                leaf1.style.left = "48%";
                leaf1.style.width = "70px";
                leaf1.style.height = "95px";
                leaf1.style.transform = "rotate(-35deg)";

                const leaf2 = document.createElement("div");
                leaf2.className = "catalog-preview__decoration catalog-preview__decoration--botanical-leaf";
                leaf2.style.top = "42%";
                leaf2.style.left = "28%";
                leaf2.style.width = "75px";
                leaf2.style.height = "100px";
                leaf2.style.transform = "rotate(28deg)";
                leaf2.style.animationDelay = "100ms";

                const leaf3 = document.createElement("div");
                leaf3.className = "catalog-preview__decoration catalog-preview__decoration--botanical-leaf";
                leaf3.style.top = "56%";
                leaf3.style.left = "68%";
                leaf3.style.width = "65px";
                leaf3.style.height = "90px";
                leaf3.style.transform = "rotate(-28deg)";
                leaf3.style.animationDelay = "200ms";

                return [stem1, leaf1, leaf2, leaf3];
            },
            herbal: () => {
                const herb1 = document.createElement("div");
                herb1.className = "catalog-preview__decoration catalog-preview__decoration--herb";
                herb1.style.top = "25%";
                herb1.style.left = "35%";
                herb1.style.width = "80px";
                herb1.style.height = "120px";
                herb1.style.transform = "rotate(-18deg)";

                const herb2 = document.createElement("div");
                herb2.className = "catalog-preview__decoration catalog-preview__decoration--herb";
                herb2.style.top = "45%";
                herb2.style.left = "70%";
                herb2.style.width = "90px";
                herb2.style.height = "130px";
                herb2.style.transform = "rotate(22deg)";
                herb2.style.animationDelay = "100ms";

                const sprout = document.createElement("div");
                sprout.className = "catalog-preview__decoration catalog-preview__decoration--sprout";
                sprout.style.top = "35%";
                sprout.style.left = "60%";

                return [herb1, herb2, sprout];
            },
            spa: () => {
                const bubble1 = document.createElement("div");
                bubble1.className = "catalog-preview__decoration catalog-preview__decoration--spa-bubble";
                bubble1.style.top = "28%";
                bubble1.style.left = "38%";
                bubble1.style.width = "70px";
                bubble1.style.height = "70px";

                const bubble2 = document.createElement("div");
                bubble2.className = "catalog-preview__decoration catalog-preview__decoration--spa-bubble";
                bubble2.style.top = "50%";
                bubble2.style.left = "70%";
                bubble2.style.width = "55px";
                bubble2.style.height = "55px";
                bubble2.style.animationDelay = "100ms";

                const steam = document.createElement("div");
                steam.className = "catalog-preview__decoration catalog-preview__decoration--steam";
                steam.style.top = "18%";
                steam.style.left = "55%";

                return [bubble1, bubble2, steam];
            },
            floral: () => {
                const petal1 = document.createElement("div");
                petal1.className = "catalog-preview__decoration catalog-preview__decoration--floral-petal";
                petal1.style.top = "25%";
                petal1.style.left = "40%";
                petal1.style.width = "60px";
                petal1.style.height = "80px";
                petal1.style.transform = "rotate(-25deg)";

                const petal2 = document.createElement("div");
                petal2.className = "catalog-preview__decoration catalog-preview__decoration--floral-petal";
                petal2.style.top = "35%";
                petal2.style.left = "68%";
                petal2.style.width = "55px";
                petal2.style.height = "75px";
                petal2.style.transform = "rotate(30deg)";
                petal2.style.animationDelay = "100ms";

                const center = document.createElement("div");
                center.className = "catalog-preview__decoration catalog-preview__decoration--floral-center";
                center.style.top = "40%";
                center.style.left = "50%";

                return [petal1, petal2, center];
            },
            sea: () => {
                const wave1 = document.createElement("div");
                wave1.className = "catalog-preview__decoration catalog-preview__decoration--wave";
                wave1.style.top = "25%";
                wave1.style.left = "40%";
                wave1.style.width = "140px";
                wave1.style.height = "140px";

                const wave2 = document.createElement("div");
                wave2.className = "catalog-preview__decoration catalog-preview__decoration--wave";
                wave2.style.top = "45%";
                wave2.style.left = "65%";
                wave2.style.width = "100px";
                wave2.style.height = "100px";
                wave2.style.opacity = "0.7";
                wave2.style.animationDelay = "120ms";

                const drop = document.createElement("div");
                drop.className = "catalog-preview__decoration catalog-preview__decoration--drop";
                drop.style.top = "15%";
                drop.style.left = "72%";
                drop.style.width = "50px";
                drop.style.height = "70px";

                return [wave1, wave2, drop];
            },
            olive: () => {
                const leaf1 = document.createElement("div");
                leaf1.className = "catalog-preview__decoration catalog-preview__decoration--leaf";
                leaf1.style.top = "22%";
                leaf1.style.left = "35%";
                leaf1.style.width = "80px";
                leaf1.style.height = "120px";
                leaf1.style.transform = "rotate(-22deg)";

                const leaf2 = document.createElement("div");
                leaf2.className = "catalog-preview__decoration catalog-preview__decoration--leaf";
                leaf2.style.top = "50%";
                leaf2.style.left = "68%";
                leaf2.style.width = "90px";
                leaf2.style.height = "140px";
                leaf2.style.transform = "rotate(18deg)";
                leaf2.style.animationDelay = "100ms";

                const branch = document.createElement("div");
                branch.className = "catalog-preview__decoration catalog-preview__decoration--branch";
                branch.style.top = "35%";
                branch.style.left = "30%";

                return [leaf1, leaf2, branch];
            },
            orchard: () => {
                const fruit1 = document.createElement("div");
                fruit1.className = "catalog-preview__decoration catalog-preview__decoration--fruit";
                fruit1.style.top = "28%";
                fruit1.style.left = "42%";
                fruit1.style.width = "70px";
                fruit1.style.height = "70px";

                const fruit2 = document.createElement("div");
                fruit2.className = "catalog-preview__decoration catalog-preview__decoration--fruit";
                fruit2.style.top = "48%";
                fruit2.style.left = "70%";
                fruit2.style.width = "60px";
                fruit2.style.height = "60px";
                fruit2.style.animationDelay = "90ms";

                const leaf = document.createElement("div");
                leaf.className = "catalog-preview__decoration catalog-preview__decoration--orchard-leaf";
                leaf.style.top = "20%";
                leaf.style.left = "65%";

                return [fruit1, fruit2, leaf];
            },
            confetti: () => {
                const spark1 = document.createElement("div");
                spark1.className = "catalog-preview__decoration catalog-preview__decoration--spark";
                spark1.style.top = "30%";
                spark1.style.left = "35%";

                const spark2 = document.createElement("div");
                spark2.className = "catalog-preview__decoration catalog-preview__decoration--spark";
                spark2.style.top = "45%";
                spark2.style.left = "70%";
                spark2.style.animationDelay = "80ms";

                const spark3 = document.createElement("div");
                spark3.className = "catalog-preview__decoration catalog-preview__decoration--spark";
                spark3.style.top = "55%";
                spark3.style.left = "50%";
                spark3.style.animationDelay = "160ms";

                return [spark1, spark2, spark3];
            },
            forest: () => {
                const tree1 = document.createElement("div");
                tree1.className = "catalog-preview__decoration catalog-preview__decoration--tree";
                tree1.style.top = "25%";
                tree1.style.left = "30%";
                tree1.style.width = "90px";
                tree1.style.height = "130px";

                const tree2 = document.createElement("div");
                tree2.className = "catalog-preview__decoration catalog-preview__decoration--tree";
                tree2.style.top = "40%";
                tree2.style.left = "68%";
                tree2.style.width = "75px";
                tree2.style.height = "100px";
                tree2.style.animationDelay = "100ms";

                const moss = document.createElement("div");
                moss.className = "catalog-preview__decoration catalog-preview__decoration--moss";
                moss.style.top = "48%";
                moss.style.left = "40%";

                return [tree1, tree2, moss];
            },
            coastal: () => {
                const rock1 = document.createElement("div");
                rock1.className = "catalog-preview__decoration catalog-preview__decoration--rock";
                rock1.style.top = "35%";
                rock1.style.left = "32%";

                const rock2 = document.createElement("div");
                rock2.className = "catalog-preview__decoration catalog-preview__decoration--rock";
                rock2.style.top = "50%";
                rock2.style.left = "70%";
                rock2.style.opacity = "0.8";
                rock2.style.animationDelay = "100ms";

                const seaweed = document.createElement("div");
                seaweed.className = "catalog-preview__decoration catalog-preview__decoration--seaweed";
                seaweed.style.top = "42%";
                seaweed.style.left = "55%";

                return [rock1, rock2, seaweed];
            },
            minimal: () => {
                const orb1 = document.createElement("div");
                orb1.className = "catalog-preview__decoration catalog-preview__decoration--orb";
                orb1.style.top = "30%";
                orb1.style.left = "40%";
                orb1.style.width = "60px";
                orb1.style.height = "60px";

                const orb2 = document.createElement("div");
                orb2.className = "catalog-preview__decoration catalog-preview__decoration--orb";
                orb2.style.top = "50%";
                orb2.style.left = "68%";
                orb2.style.width = "50px";
                orb2.style.height = "50px";
                orb2.style.animationDelay = "100ms";

                return [orb1, orb2];
            },
            citrus: () => {
                const bubble1 = document.createElement("div");
                bubble1.className = "catalog-preview__decoration catalog-preview__decoration--bubble";
                bubble1.style.top = "28%";
                bubble1.style.left = "38%";
                bubble1.style.width = "75px";
                bubble1.style.height = "75px";

                const bubble2 = document.createElement("div");
                bubble2.className = "catalog-preview__decoration catalog-preview__decoration--bubble";
                bubble2.style.top = "48%";
                bubble2.style.left = "70%";
                bubble2.style.width = "60px";
                bubble2.style.height = "60px";
                bubble2.style.animationDelay = "100ms";

                const leaf = document.createElement("div");
                leaf.className = "catalog-preview__decoration catalog-preview__decoration--citrus-leaf";
                leaf.style.top = "18%";
                leaf.style.left = "65%";

                return [bubble1, bubble2, leaf];
            }
        };

        return decorator[theme] ? decorator[theme]() : decorator.minimal();
    }

    function createFlamencoLayer(gin) {
        if (gin.id !== "jr-fl") {
            return null;
        }

        const layer = document.createElement("div");
        layer.className = "catalog-preview__flamenco";

        const fan = document.createElement("div");
        fan.className = "catalog-preview__fan";

        const dancer = document.createElement("div");
        dancer.className = "catalog-preview__dancer";
        dancer.innerHTML = `
            <span class="catalog-preview__petal catalog-preview__petal--a"></span>
            <span class="catalog-preview__petal catalog-preview__petal--b"></span>
            <span class="catalog-preview__petal catalog-preview__petal--c"></span>
        `;

        layer.appendChild(fan);
        layer.appendChild(dancer);
        return layer;
    }

    function createCorkscrew() {
        const corkscrew = document.createElement("div");
        corkscrew.className = "corkscrew";
        corkscrew.innerHTML = `
            <svg viewBox="0 0 24 80" xmlns="http://www.w3.org/2000/svg" width="24" height="80">
                <g fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round">
                    <!-- Manico -->
                    <rect x="4" y="2" width="16" height="14" rx="2" fill="currentColor" opacity="0.9"/>
                    <!-- Spira -->
                    <circle cx="12" cy="30" r="4" opacity="0.8"/>
                    <circle cx="12" cy="40" r="5" opacity="0.7"/>
                    <circle cx="12" cy="52" r="5" opacity="0.7"/>
                    <circle cx="12" cy="64" r="4" opacity="0.8"/>
                    <!-- Punta -->
                    <path d="M 10 72 Q 12 75 12 80 Q 12 75 14 72" stroke-width="1.5" fill="none"/>
                </g>
            </svg>
        `;
        return corkscrew;
    }

    function playCorkScrewAnimation(card) {
        return new Promise((resolve) => {
            const corkscrew = createCorkscrew();
            document.body.appendChild(corkscrew);

            const cardRect = card.getBoundingClientRect();
            const bottleImage = card.querySelector("img");
            const bottleRect = bottleImage ? bottleImage.getBoundingClientRect() : cardRect;
            
            const cardCenterX = bottleRect.left + bottleRect.width / 2;
            const bottleTopY = bottleRect.top;

            const startX = -50;
            const startY = window.innerHeight / 2;

            corkscrew.style.setProperty("--start-x", `${startX}px`);
            corkscrew.style.setProperty("--start-y", `${startY}px`);
            corkscrew.style.setProperty("--end-x", `${cardCenterX}px`);
            corkscrew.style.setProperty("--end-y", `${bottleTopY}px`);

            window.requestAnimationFrame(() => {
                corkscrew.classList.add("is-animating");
            });

            window.setTimeout(() => {
                corkscrew.remove();
                resolve();
            }, 850);
        });
    }

    function playBottlePreview(gin, card) {
        card.classList.add("is-opening");

        playCorkScrewAnimation(card).then(() => {
            const overlay = document.createElement("div");
            overlay.className = "catalog-preview-overlay";
            overlay.style.setProperty("--preview-color", gin["bg-color"] || "#D4AF37");

            const stage = document.createElement("div");
            stage.className = "catalog-preview-stage";

            const glow = document.createElement("div");
            glow.className = "catalog-preview-stage__glow";

            const image = card.querySelector("img");
            const bottle = document.createElement("img");
            bottle.className = "catalog-preview-stage__bottle";
            bottle.src = image ? image.src : `./assets/images/${gin.id}.png`;
            bottle.alt = `Preview ${gin.nome}`;

            const meta = document.createElement("div");
            meta.className = "catalog-preview-stage__meta";
            meta.innerHTML = `
                <span>Apri bottiglia</span>
                <strong>${gin.nome}</strong>
                <em>${gin.provenienza}</em>
            `;

            const decorationLayer = createPreviewDecorationLayer(gin);
            const flamencoLayer = createFlamencoLayer(gin);

            stage.appendChild(glow);
            if (decorationLayer.childElementCount > 0) {
                stage.appendChild(decorationLayer);
            }
            if (flamencoLayer) {
                stage.appendChild(flamencoLayer);
            }
            stage.appendChild(bottle);
            stage.appendChild(meta);

            overlay.appendChild(stage);
            document.body.appendChild(overlay);

            window.requestAnimationFrame(() => {
                overlay.classList.add("is-visible");
            });

            window.setTimeout(() => {
                overlay.classList.remove("is-visible");
                overlay.classList.add("is-leaving");
            }, 1100);

            window.setTimeout(() => {
                window.location.href = `./bottle.html?id=${gin.id}`;
            }, 1600);
        });
    }

    function renderCatalog(data) {
        if (!catalogGrid) return;

        const filteredData = filterGins(data);

        catalogGrid.innerHTML = "";

        filteredData.forEach((gin, index) => {
            catalogGrid.appendChild(createBottleCard(gin, index));
        });

        if (filteredData.length === 0) {
            const emptyState = document.createElement("div");
            emptyState.className = "home-error home-error--filters";
            emptyState.textContent = "Nessuna bottiglia corrisponde ai filtri selezionati.";
            catalogGrid.appendChild(emptyState);
        }

        updateFilterSummary(filteredData.length);

        if (window.polyfillCountryFlagEmojis) {
            window.polyfillCountryFlagEmojis();
        }
    }

    function createVideoSection(gin) {
        const section = document.createElement("section");
        section.classList.add("terroir");
        section.setAttribute("data-gin-id", gin.id);
        section.setAttribute("data-gin-name", gin.nome);

        const videoContainer = document.createElement("div");
        videoContainer.classList.add("video-container");

        const video = document.createElement("video");
        video.src = `./assets/video/${gin.id}.mp4`;
        video.autoplay = true;
        video.loop = true;
        video.playsInline = true;
        video.muted = false;
        video.volume = 0.5;
        video.preload = "auto";

        video.addEventListener("error", (e) => {
            console.error(`Errore caricamento video per ${gin.id}:`, e);
        });

        videoContainer.appendChild(video);
        ginVideos.push(video);

        const overlay = document.createElement("div");
        overlay.classList.add("video-overlay");

        const glassOverlay = document.createElement("div");
        glassOverlay.classList.add("glass-overlay");

        const audioBadge = document.createElement("div");
        audioBadge.classList.add("audio-badge");

        const icon = document.createElement("span");
        icon.classList.add("icon");
        icon.textContent = "🔊";

        const text = document.createElement("span");
        text.textContent = "Audio attivo";

        audioBadge.appendChild(icon);
        audioBadge.appendChild(text);

        audioBadge.addEventListener("click", (e) => {
            e.stopPropagation();

            if (video.muted) {
                video.muted = false;
                video.volume = 0.5;
                icon.textContent = "🔊";
                text.textContent = "Audio attivo";
                audioBadge.classList.remove("muted");
            } else {
                video.muted = true;
                icon.textContent = "🔇";
                text.textContent = "Audio disattivato";
                audioBadge.classList.add("muted");
            }
        });

        const svelaBtn = document.createElement("button");
        svelaBtn.classList.add("btn-svela-bottiglia");
        svelaBtn.appendChild(document.createTextNode(`Svela ${gin.nome}`));

        svelaBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            e.preventDefault();
            window.location.href = `./bottle.html?id=${gin.id}`;
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    video.play().catch((error) => {
                        console.log(`Riproduzione video ${gin.id}:`, error);

                        if (error.name === "NotAllowedError") {
                            video.muted = true;
                            video.play().catch((err) => console.log("Ancora bloccato:", err));
                        }
                    });
                } else {
                    video.pause();
                }
            });
        }, { threshold: 0.3 });

        observer.observe(section);

        section.appendChild(videoContainer);
        section.appendChild(overlay);
        section.appendChild(glassOverlay);
        section.appendChild(audioBadge);
        section.appendChild(svelaBtn);

        return section;
    }

    async function ensureVideoSections() {
        if (videoSectionsCreated) {
            return ginData;
        }

        try {
            const data = await loadGinList();

            document.querySelectorAll(".terroir").forEach((section) => {
                section.remove();
            });

            ginVideos = [];

            data.forEach((gin) => {
                container.appendChild(createVideoSection(gin));
            });

            videoSectionsCreated = true;
            return data;
        } catch (err) {
            console.error("Errore caricamento gin:", err);
            const fallbackMsg = document.createElement("div");
            fallbackMsg.className = "home-error";
            fallbackMsg.textContent = "Errore nel caricamento dei gin. Riprova più tardi.";
            container.appendChild(fallbackMsg);
            return [];
        }
    }

    function updateTextDisplay() {
        if (!heroEnabled) {
            return;
        }

        const currentWordIndex = Math.floor(scrollAccumulator / sensitivity);
        const percent = Math.min((scrollAccumulator / (sensitivity * totalWords)) * 100, 100);

        progressBar.style.width = `${percent}%`;

        if (currentWordIndex <= words2.length) {
            text2.innerHTML = words2.slice(0, currentWordIndex).join(" ");
            text2.classList.add("fade");
            text3.innerHTML = "";
            ctaText.style.display = "none";
        } else if (currentWordIndex <= totalWords) {
            const index3 = currentWordIndex - words2.length;
            text2.innerHTML = words2.join(" ");
            text3.innerHTML = words3.slice(0, index3).join(" ");
            text3.classList.add("fade");
            ctaText.style.display = "none";
        } else if (!heroComplete) {
            heroComplete = true;
            text2.innerHTML = words2.join(" ");
            text3.innerHTML = words3.join(" ");
            ctaText.style.display = "inline-block";
            progressBar.style.width = "100%";

            setTimeout(() => {
                scrollToPrimaryTarget();
            }, 800);
        }
    }

    function resetHeroState() {
        if (!heroEnabled) {
            return;
        }

        heroComplete = false;
        scrollAccumulator = 0;
        text2.innerHTML = "";
        text3.innerHTML = "";
        ctaText.style.display = "none";
        progressBar.style.width = "0%";
        text2.classList.remove("fade");
        text3.classList.remove("fade");
    }

    if (heroEnabled) {
        hero.addEventListener("mousemove", (e) => {
            const rect = hero.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            hero.style.setProperty("--x", `${x}%`);
            hero.style.setProperty("--y", `${y}%`);
        });

        ctaText.addEventListener("click", scrollToPrimaryTarget);
    }

    renderFilterPanel();
    filterButton = viewButtons.find((button) => button.dataset.view === "filter") || null;
    updateFilterButtonState();

    viewButtons.forEach((button) => {
        if (button.dataset.view === "filter") {
            button.addEventListener("click", toggleFilterPanel);
            return;
        }

        button.addEventListener("click", () => {
            setView(button.dataset.view || "list");
        });
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && filtersPanelOpen) {
            closeFilterPanel();
        }
    });

    if (heroEnabled) {
        window.addEventListener("wheel", (e) => {
            if (heroComplete) return;

            if (container.scrollTop < 10) {
                e.preventDefault();
            }

            scrollAccumulator += Math.abs(e.deltaY) * 0.3;

            if (!ticking) {
                window.requestAnimationFrame(() => {
                    updateTextDisplay();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: false });
    }

    container.addEventListener("scroll", () => {
        if (heroEnabled && container.scrollTop === 0) {
            resetHeroState();
            pauseVideos();
            document.body.style.overflow = "";
            document.documentElement.style.overflow = "";
            container.style.overflowY = "scroll";
        }
    });

    if (heroEnabled) {
        let touchStartY = 0;

        container.addEventListener("touchstart", (e) => {
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        container.addEventListener("touchmove", (e) => {
            if (heroComplete || container.scrollTop > 10) return;

            const touchEndY = e.touches[0].clientY;
            const deltaY = touchStartY - touchEndY;

            if (Math.abs(deltaY) > 5) {
                e.preventDefault();
                scrollAccumulator += Math.abs(deltaY) * 0.3;

                if (!ticking) {
                    window.requestAnimationFrame(() => {
                        updateTextDisplay();
                        ticking = false;
                    });
                    ticking = true;
                }
            }
        }, { passive: false });
    }

    loadGinList()
        .then((data) => {
            ginData = data;
            syncFilterInputs();
            renderCatalog(data);
        })
        .then(() => {
            setView("list", { scrollToTarget: false });
        })
        .catch((err) => {
            console.error("Errore nel caricamento iniziale della home:", err);
            if (catalogGrid) {
                catalogGrid.innerHTML = '<div class="home-error">Errore nel caricamento della lista bottiglie.</div>';
            }
        });

})();