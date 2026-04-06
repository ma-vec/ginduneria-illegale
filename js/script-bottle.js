document.addEventListener("DOMContentLoaded", () => {

    const params = new URLSearchParams(window.location.search);
    const ginId = params.get("id");

    const nome = document.getElementById("nome-bottiglia");
    const pos = document.getElementById("pos");
    const botanic = document.getElementById("botanic");
    const aggettivi = document.getElementById("aggettivi");
    const bottleImage = document.getElementById("bottle-image");
    const profile = document.getElementById("profile");
    const tonicbtn = document.getElementById("add-tonic-btn");
    const limited = document.getElementById("limited");
    const etValue = document.getElementById("etValue");
    const etDescription = document.getElementById("etDescription");
    const etAmbiente = document.getElementById("etAmbiente");
    const etSociale = document.getElementById("etSociale");
    const etTradizione = document.getElementById("etTradizione");
    const etAmbienteNum = document.getElementById("etAmbienteNum");
    const etSocialeNum = document.getElementById("etSocialeNum");
    const etTradizioneNum = document.getElementById("etTradizioneNum");
    const etRating = document.getElementById("etRating");
    const nomeParl = document.getElementById("nomeParl");
    const ParagAreaP = document.getElementById("paragAreaP");
    const motPol = document.getElementById("motPol");
    const ifEmpty = document.getElementById("ifEmpty");
    const temp = document.getElementById("temp");


    const indianColor = "#DAA520";
    const mediterraneanColor = "#0495CE";
    let radarChartInstance;

    // Totale politico
    const totSeggi = 600;
    let edx=0;
    let cdx=0;
    let dx=0;
    let sx=0
    let csx=0;
    let esx=0; 
    let perc = [];

    // Navigazione tra bottiglie
    let ginData = [];
    const isNavigationTransition = sessionStorage.getItem("navTransition") === "true";
    
    function clearNavTransition() {
        sessionStorage.removeItem("navTransition");
    }
    
    async function loadGinList() {
        try {
            const response = await fetch("./data/gin_list.json");
            if (!response.ok) throw new Error("Errore nel caricamento gin_list.json");
            ginData = await response.json();
        } catch (err) {
            console.error("Errore nel caricamento della lista gin:", err);
        }
    }
    
    function getCurrentGinIndex() {
        return ginData.findIndex(g => g.id === ginId);
    }
    
    function getNextGinId(direction = 1) {
        const currentIndex = getCurrentGinIndex();
        if (currentIndex === -1) return null;
        
        const newIndex = (currentIndex + direction + ginData.length) % ginData.length;
        return ginData[newIndex].id;
    }
    
    async function navigateToGin(nextGinId) {
        if (!nextGinId) return;
        
        const currentGin = ginData.find(g => g.id === ginId);
        const nextGin = ginData.find(g => g.id === nextGinId);
        
        if (!currentGin || !nextGin) return;
        
        // Setta il flag per indicare che la prossima pagina viene da una transizione
        sessionStorage.setItem("navTransition", "true");
        
        const bottleInfo = document.getElementById("bottle-info");
        const currentColor = currentGin["bg-color"];
        const nextColor = nextGin["bg-color"];
        
        // Aggiungi classe di transizione
        bottleInfo.classList.add("transitioning");
        
        // Interpolazione del colore
        const startColor = hexToColor(currentColor);
        const endColor = hexToColor(nextColor);
        
        const startTime = performance.now();
        const animationDuration = 1500; // 1.5 secondi
        
        function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / animationDuration, 1);
            
            const r = Math.round(startColor.r + (endColor.r - startColor.r) * progress);
            const g = Math.round(startColor.g + (endColor.g - startColor.g) * progress);
            const b = Math.round(startColor.b + (endColor.b - startColor.b) * progress);
            
            const interpolatedColor = `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
            document.documentElement.style.setProperty('--gin-color', interpolatedColor);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Navigazione completata, vai all'URL
                window.location.href = `./bottle.html?id=${nextGinId}`;
            }
        }
        
        requestAnimationFrame(animate);
    }
    
    function hexToColor(hex) {
        return {
            r: parseInt(hex.substring(1, 3), 16),
            g: parseInt(hex.substring(3, 5), 16),
            b: parseInt(hex.substring(5, 7), 16)
        };
    }
    
    function setupNavigationButtons() {
        const prevBtn = document.getElementById("prev-bottle");
        const nextBtn = document.getElementById("next-bottle");
        
        if (prevBtn) {
            prevBtn.addEventListener("click", () => {
                const prevGinId = getNextGinId(-1);
                if (prevGinId) {
                    navigateToGin(prevGinId);
                }
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener("click", () => {
                const nextGinId = getNextGinId(1);
                if (nextGinId) {
                    navigateToGin(nextGinId);
                }
            });
        }
    }

    function setupDragAndKeyboard() {
        const bottleInfo = document.getElementById("bottle-info");
        let isDragging = false;
        let startX = 0;
        let currentX = 0;

        // ============================================================
        // DRAG HANDLER
        // ============================================================
        bottleInfo.addEventListener("mousedown", (e) => {
            isDragging = true;
            startX = e.clientX;
            currentX = startX;
            bottleInfo.style.cursor = "grabbing";
            bottleInfo.classList.add("dragging");
        });

        document.addEventListener("mousemove", (e) => {
            if (!isDragging) return;
            
            currentX = e.clientX;
            const deltaX = currentX - startX;
            const dragThreshold = window.innerWidth * 0.2; // 20% della larghezza dello schermo
            
            // Calcola l'opacità dell'altra bottiglia in base al drag
            const opacity = Math.min(Math.abs(deltaX) / dragThreshold, 1);
            bottleInfo.style.setProperty("--drag-opacity", opacity);
            
            // Applica un leggero offset visivo
            const offsetAmount = (deltaX / window.innerWidth) * 10; // max 10% di spostamento
            bottleInfo.style.setProperty("--drag-offset", `${offsetAmount}%`);
        });

        document.addEventListener("mouseup", (e) => {
            if (!isDragging) return;
            isDragging = false;
            bottleInfo.style.cursor = "grab";
            bottleInfo.classList.remove("dragging");
            
            const deltaX = currentX - startX;
            const dragThreshold = window.innerWidth * 0.2; // 20% della larghezza
            
            // Se il drag è abbastanza lungo, naviga
            if (Math.abs(deltaX) > dragThreshold) {
                const direction = deltaX > 0 ? -1 : 1; // drag destro = indietro, drag sinistro = avanti
                const nextGinId = getNextGinId(direction);
                if (nextGinId) {
                    navigateToGin(nextGinId);
                }
            } else {
                // Rimbalza indietro con transizione smooth
                bottleInfo.classList.add("snap-back");
                bottleInfo.style.setProperty("--drag-opacity", "0");
                bottleInfo.style.setProperty("--drag-offset", "0%");
                
                // Rimuovi la classe dopo la transizione
                setTimeout(() => {
                    bottleInfo.classList.remove("snap-back");
                }, 300);
            }
        });

        // ============================================================
        // KEYBOARD HANDLER
        // ============================================================
        document.addEventListener("keydown", (e) => {
            if (e.key === "ArrowLeft") {
                const prevGinId = getNextGinId(-1);
                if (prevGinId) {
                    navigateToGin(prevGinId);
                }
            } else if (e.key === "ArrowRight") {
                const nextGinId = getNextGinId(1);
                if (nextGinId) {
                    navigateToGin(nextGinId);
                }
            }
        });

        // Imposta il cursore su "grab" quando si entra nell'area
        bottleInfo.addEventListener("mouseenter", () => {
            if (!isDragging) {
                bottleInfo.style.cursor = "grab";
            }
        });

        bottleInfo.addEventListener("mouseleave", () => {
            if (!isDragging) {
                bottleInfo.style.cursor = "default";
            }
        });
    }

    function getPoliticalAreaId(item) {
        if (!item || !item.politicalArea) return null;
        if (typeof item.politicalArea === "string") return item.politicalArea;
        return item.politicalArea.id || null;
    }

    async function LoadBottle() {

        if (!ginId) {
            alert("ID bottiglia non fornito nel URL");
            return;
        }

        try {
            const response = await fetch("./data/gin_list.json");

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const totgin = data.length;

            data.forEach(element => {
                const areaId = getPoliticalAreaId(element);
                switch (areaId) {
                    case "edx":
                        edx++;
                        break;
                    case "cdx":
                        cdx++;
                        break;
                    case "dx":
                        dx++;
                        break;
                    case "sx":
                        sx++;
                        break;
                    case "csx":
                        csx++;
                        break;
                    case "esx":
                        esx++;
                        break;
                }
            });

            perc[0] = edx / totgin;
            perc[1] = cdx / totgin;
            perc[2] = dx / totgin;
            perc[3] = sx / totgin;
            perc[4] = csx / totgin;
            perc[5] = esx / totgin;

            const ginObj = data.find(g => g.id === ginId);

            if (!ginObj) {
                alert("Bottiglia non trovata");
                return;
            }

            async function updateTemp() {
                try {
                    const weather = await getCurrentWeather(ginObj.coordinate.lat, ginObj.coordinate.lon);
                    const weatherEmoji = getWeatherEmoji(weather.weatherCode, weather.isDay);
                    const roundedTemp = Math.round(weather.temperature);
                    temp.textContent = `${weatherEmoji} ${roundedTemp} °C`;
                } catch (err) {
                    console.error("Errore nel caricamento meteo:", err);
                    temp.textContent = "-- °C";
                }
            }
            updateTemp();
            nome.textContent = ginObj.nome;
            pos.textContent = ginObj.provenienza;
            bottleImage.src = `assets/images/${ginObj.id}.png`;

            botanic.textContent = ginObj.botaniche.join(", ")+" • "+ginObj.alc+"% alc.";
            aggettivi.textContent = ginObj.aggettivi.join(" • ");

            bottleImage.alt = `Immagine di ${ginObj.nome}`;
            profile.textContent = ginObj.profilo;
            if (ginObj.limited) {
                limited.textContent = ginObj.limited;
            }
            if(ginObj.isEmpty) {
                ifEmpty.textContent = "Esaurito";
            }

            document.documentElement.style.setProperty('--gin-color', ginObj["bg-color"]);

            LoadMiniMap(ginObj);

            LoadRadar(ginObj);

            LoadEthicalIndex(ginObj);

            LoadPoliticalChart(ginObj);

        } catch (err) {
            console.error(err);
            alert("Errore nel caricamento: " + err.message);
        }
    }
    
    // Carica il grafico radar
    // Converte HEX in rgba con opacità
    function hexToRGBA(hex, opacity) {
        const r = parseInt(hex.substring(1,3), 16);
        const g = parseInt(hex.substring(3,5), 16);
        const b = parseInt(hex.substring(5,7), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    function LoadRadar(gin) {

    const ctx = document.getElementById('radarChart').getContext('2d');

    const radarLabels = [
        "Dryness",
        "Uniqueness",
        "Balsamic",
        "Salinity",
        "Citrus",
        "Botanic Complexity",
        "Persistence"
    ];

    const radarValues = [
        gin.radar.dryness,
        gin.radar.uniqueness,
        gin.radar.balsamic,
        gin.radar.salinity,
        gin.radar.citrus,
        gin.radar["botanic-complexity"],
        gin.radar.persistence
    ];

    const mainColor = gin["bg-color"];

    const valueLabelPlugin = {
        id: 'valueLabels',
        afterDatasetsDraw(chart) {
            const { ctx } = chart;

            chart.data.datasets.forEach((dataset, datasetIndex) => {
                const meta = chart.getDatasetMeta(datasetIndex);

                ctx.save();
                ctx.fillStyle = dataset.borderColor;
                ctx.font = "12px sans-serif";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";

                meta.data.forEach((point, index) => {
                    const value = dataset.data[index];
                    const offset = datasetIndex === 0 ? -12 : 12;
                    ctx.fillText(value, point.x, point.y + offset);
                });

                ctx.restore();
            });
        }
    };

    radarChartInstance = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: radarLabels,
            datasets: [{
                label: gin.nome,
                data: radarValues,
                backgroundColor: hexToRGBA(mainColor, 0.25),
                borderColor: mainColor,
                borderWidth: 2,
                pointBackgroundColor: mainColor,
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    angleLines: {
                        display: true,
                        color: 'rgba(255, 255, 255, 0.25)',
                        lineWidth: 0.8
                    },
                    grid: {
                        display: true,
                        color: 'rgba(255, 255, 255, 0.15)',
                        lineWidth: 0.8
                    },
                    ticks: {
                        display: false
                    },
                    pointLabels: {
                        display: true,
                        color: 'rgba(255, 255, 255, 0.6)',
                        font: {
                            family: 'Inter',
                            size: 11,
                            weight: '300'
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        },
        plugins: [valueLabelPlugin]
    });
    tonicbtn.addEventListener("click", () => {
    if (radarChartInstance.data.datasets.length === 1) {
        const txtdisclaimer = document.getElementById("tonic-disclaimer");
        if (!txtdisclaimer) {
            const disclaimer = document.createElement("p");
            disclaimer.id = "tonic-disclaimer";
            disclaimer.textContent = "Clicca sulla legenda per nascondere/mostrare a scelta i profili delle toniche e del gin";
            disclaimer.style.fontSize = "0.9em";
            disclaimer.style.fontStyle = "italic";
            disclaimer.style.marginTop = "10px";
            document.getElementById("radar-section").appendChild(disclaimer);
            tonicbtn.textContent = "Rimuovi tonica";
            addTonic(gin);
            LoadTonicTable(gin);
        }
    } else {
        radarChartInstance.data.datasets = radarChartInstance.data.datasets.slice(0,1);
        radarChartInstance.options.plugins.legend.display = false; // nascondi la legenda quando rimuovi dataset
        radarChartInstance.update();
        tonicbtn.textContent = "+ Aggiungi tonica";
        const disclaimer = document.getElementById("tonic-disclaimer");
        if (disclaimer) {
            disclaimer.remove();
        }
    }
});
}

//Aggiungi tonica al radar e tabella
function addTonic(gin) {

    if (radarChartInstance.data.datasets.length > 1) return;

    const i = gin.toniche[0].valori;
    const m = gin.toniche[1].valori;

    const IndianValues = [
        gin.radar.dryness + i.dryness,
        gin.radar.uniqueness,
        gin.radar.balsamic + i.balsamic,
        gin.radar.salinity + i.salinity,
        gin.radar.citrus + i.citrus,
        gin.radar["botanic-complexity"] + i["botanic-complexity"],
        gin.radar.persistence + i.persistence
    ];
    const MediterreanValues = [
        gin.radar.dryness + m.dryness,
        gin.radar.uniqueness,
        gin.radar.balsamic + m.balsamic,
        gin.radar.salinity + m.salinity,
        gin.radar.citrus + m.citrus,
        gin.radar["botanic-complexity"] + m["botanic-complexity"],
        gin.radar.persistence + m.persistence
    ];

    radarChartInstance.data.datasets.push({
        label: "Indian Tonic",
        data: IndianValues,
        backgroundColor: hexToRGBA(indianColor, 0.1),
        borderColor: indianColor,
        borderWidth: 3,              // bordo marcato
        pointBackgroundColor: indianColor,
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 4,
        fill: true                   // area piena
    });

    radarChartInstance.data.datasets.push({
        label: "Mediterrean Tonic",
        data: MediterreanValues,
        backgroundColor: hexToRGBA(mediterraneanColor, 0.1),
        borderColor: mediterraneanColor,
        borderWidth: 3,              // bordo marcato
        pointBackgroundColor: mediterraneanColor,
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 4,
        fill: true                   // area piena
    });

    radarChartInstance.options.plugins.legend.display = true; // mostra la legenda quando aggiungi dataset
    radarChartInstance.update();
}

//Aggiungi tabella toniche
function LoadTonicTable(gin) {

    const tableBody = document.getElementById("tonic-table-body");

    const params = [
        { key: "dryness", label: "Dryness" },
        { key: "balsamic", label: "Balsamic" },
        { key: "salinity", label: "Salinity" },
        { key: "citrus", label: "Citrus" },
        { key: "botanic-complexity", label: "Botanic Complexity" },
        { key: "persistence", label: "Persistence" }
    ];

    const indianTonic = gin.toniche.find(t => t.tipo === "indiana") || gin.toniche[0];
    const mediterraneanTonic = gin.toniche.find(t => t.tipo === "mediterranea") || gin.toniche[1];

    if (!indianTonic || !mediterraneanTonic) {
        tableBody.innerHTML = "";
        return;
    }

    let indianPrefix = "";
    let mediterraneanPrefix = "";

    if (indianTonic.consigliata) {
        indianPrefix = "⭐ ";
    }
    if (mediterraneanTonic.consigliata) {
        mediterraneanPrefix = "⭐ ";
    }

    let indianLabel = `${indianPrefix}${indianTonic.tipo}`;
    let mediterraneanLabel = `${mediterraneanPrefix}${mediterraneanTonic.tipo}`;

    let indianValues = indianTonic.valori;
    let mediterraneanValues = mediterraneanTonic.valori;


    tableBody.innerHTML = "";

    tableBody.innerHTML += `
        <tr>
            <td></td>
            <td class="indian">${indianLabel}</td>
            <td class="med">${mediterraneanLabel}</td>

            <td class="spacer"></td>

            <td></td>
            <td class="indian">${indianLabel}</td>
            <td class="med">${mediterraneanLabel}</td>
        </tr>
    `;

    for (let i = 0; i < 3; i++) {

        const left = params[i];
        const right = params[i + 3];

        const row = `
            <tr>
                <td class="param">${left.label}</td>
                <td class="indian">${indianValues[left.key]}</td>
                <td class="med">${mediterraneanValues[left.key]}</td>

                <td class="spacer"></td>

                <td class="param">${right.label}</td>
                <td class="indian">${indianValues[right.key]}</td>
                <td class="med">${mediterraneanValues[right.key]}</td>
            </tr>
        `;

        tableBody.innerHTML += row;
    }
}

function LoadMiniMap(gin) {
    const mapEl = document.getElementById('mini-map');
    if (!mapEl || !gin.coordinate) return;
    if (window.innerWidth <= 768) return;

    const map = L.map('mini-map', {
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false,
        keyboard: false,
        boxZoom: false
    }).setView([gin.coordinate.lat, gin.coordinate.lon], 10);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);

    // Disabilita ogni interazione residua
    map._handlers.forEach(h => h.disable());
}


function LoadEthicalIndex(gin) {
    const etichalDiv = document.getElementById("etichaldiv");
    if (!gin.ethicalIndex) {
        if(etichalDiv) etichalDiv.style.display = "none";
        return;
    }
    if(etichalDiv) etichalDiv.style.display = "flex";
    
    let txtValue;
    if (gin.ethicalIndex.tot >= 85) {
        txtValue = "Eccellente";
    } else if (gin.ethicalIndex.tot >= 75) {
        txtValue = "Buono";
    } else if (gin.ethicalIndex.tot >= 60) {
        txtValue = "Sufficiente";
    } else if (gin.ethicalIndex.tot >= 40) {
        txtValue = "Scarso";
    } else {
        txtValue = "Pessimo";
    }
    etValue.textContent = gin.ethicalIndex.tot+" / 100";
    etDescription.textContent = gin.ethicalIndex.motivation;
    
    // Set widths for bars
    etAmbiente.style.width = gin.ethicalIndex.env + "%";
    etSociale.style.width = gin.ethicalIndex.soc + "%";
    etTradizione.style.width = gin.ethicalIndex.trad + "%";
    
    // Set text numbers
    etAmbienteNum.textContent = gin.ethicalIndex.env;
    etSocialeNum.textContent = gin.ethicalIndex.soc;
    etTradizioneNum.textContent = gin.ethicalIndex.trad;
    
    etRating.textContent = txtValue;
}

function LoadPoliticalChart(gin) {
        console.log("perc:", perc);
console.log("totSeggi:", totSeggi);
    const highchartsRef = window.Highcharts;
    if (!highchartsRef) {
        console.error("Highcharts non caricato: impossibile renderizzare il parlamento");
        return;
    }
    if (!highchartsRef.seriesTypes || !highchartsRef.seriesTypes.item) {
        console.error("Modulo item-series non caricato: impossibile usare il grafico parlamento");
        return;
    }

    const container = document.getElementById("parliament-chart");
    if (!container) return;
    container.style.width = "100%";
    container.style.maxWidth = "900px";
    container.style.height = "430px";
    container.style.margin = "0 auto";


    const areas = [
        
        { name: "Centri Sociali e No-Borders", value: Number(perc[5] || 0), color: "#d8150f", label: "ESX" },
        { name: "Sinistra", value: Number(perc[3] || 0), color: "#f39e4f", label: "SX" },
        { name: "Radical Chic", value: Number(perc[4] || 0), color: "#ecc412", label: "CSX" },
        { name: "Centrodestra", value: Number(perc[1] || 0), color: "#45ca10", label: "CDX" },
        { name: "Conservatori", value: Number(perc[2] || 0), color: "#5dcbec", label: "DX" },
        { name: "Sovranismo Hard", value: Number(perc[0] || 0), color: "#0b08aa", label: "EDX" },
    ];

    const seats = areas.map((area) => Math.round(area.value * totSeggi));
    const seatDelta = totSeggi - seats.reduce((acc, value) => acc + value, 0);
    if (seatDelta !== 0) {
        const biggestIdx = seats.indexOf(Math.max(...seats));
        seats[biggestIdx] += seatDelta;
    }

    const ginAreaId = getPoliticalAreaId(gin);
    const areaIdByLabel = {
        EDX: "edx",
        CDX: "cdx",
        DX: "dx",
        SX: "sx",
        CSX: "csx",
        ESX: "esx"
    };

    const seriesData = areas.map((area, index) => {
        const isSelected = areaIdByLabel[area.label] === ginAreaId;
        return {
            name: area.name,
            y: seats[index],
            color: area.color,
            label: area.label,
            borderColor: isSelected ? "#ffffff" : area.color,
            borderWidth: isSelected ? 0.8 : 0
        };
    });

    highchartsRef.chart("parliament-chart", {
        chart: {
            type: "item",
            backgroundColor: "transparent"
        },
        title: {
            text: "Parlamento dei gin",
            style: {
                color: "#ffffff"
            }
        },
        subtitle: {
            text: "",
            style: {
                color: "rgba(255,255,255,0.7)"
            }
        },
        legend: {
            labelFormat: '{name} <span style="opacity: 0.7">{y}</span>',
            itemStyle: {
                color: "#ffffff"
            }
        },
        series: [{
            name: "Seggi",
            data: seriesData,
            dataLabels: {
                enabled: true,
                format: "{point.label}",
                style: {
                    textOutline: "2px contrast",
                    fontSize: "10px"
                }
            },
            center: ["50%", "88%"],
            size: "170%",
            startAngle: -90,
            endAngle: 90
        }],
        tooltip: {
            headerFormat: "",
            pointFormat: "<b>{point.name}</b><br>{point.y} seggi"
        },
        responsive: {
            rules: [{
                condition: {
                    maxWidth: 700
                },
                chartOptions: {
                    series: [{
                        dataLabels: {
                            distance: -25
                        }
                    }]
                }
            }]
        },
        credits: {
            enabled: false
        }
    });

    let areaName = "Area non definita";
    switch (ginAreaId) {
        case "edx":
            areaName = "Sovranismo Hard";
            break;
        case "cdx":
            areaName = "Centrodestra";
            break;
        case "dx":
            areaName = "Conservatori";
            break;
        case "sx":
            areaName = "Sinistra";
            break;
        case "csx":
            areaName = "Radical Chic";
            break;
        case "esx":
            areaName = "Centri Sociali e No-Borders";
            break;
    }

    const areaCode = ginAreaId ? ginAreaId.toUpperCase() : "N/D";
    const areaMot = gin?.politicalArea && typeof gin.politicalArea === "object"
        ? (gin.politicalArea.mot || "")
        : "";

    if (nomeParl) {
        const isLifeSenator = Boolean(gin.isEmpty);
        nomeParl.textContent = "";

        const statusDot = document.createElement("span");
        statusDot.className = `status-dot ${isLifeSenator ? "status-life" : "status-active"}`;
        statusDot.setAttribute("aria-hidden", "true");

        const roleText = document.createElement("span");
        roleText.textContent = `${isLifeSenator ? "Senatore a vita" : "Parlamentare"}: ${gin.nome}`;

        nomeParl.append(statusDot, roleText);
    }
    if (ParagAreaP) ParagAreaP.textContent += `${areaName} (${areaCode})`;
    if (motPol) motPol.textContent += areaMot;
}

function getWeatherEmoji(weatherCode, isDay) {
    switch (weatherCode) {
        case 0:
            return isDay ? "☀️" : "🌙"; // Sereno
        case 1:
            return isDay ? "🌤️" : "🌙"; // Prevalentemente sereno
        case 2:
            return "⛅"; // Parzialmente nuvoloso
        case 3:
            return "☁️"; // Coperto
        case 45:
        case 48:
            return "🌫️"; // Nebbia
        case 51:
        case 53:
        case 55:
        case 56:
        case 57:
            return "🌦️"; // Pioviggine
        case 61:
        case 63:
        case 65:
        case 66:
        case 67:
        case 80:
        case 81:
        case 82:
            return "🌧️"; // Pioggia/rovesci
        case 71:
        case 73:
        case 75:
        case 77:
        case 85:
        case 86:
            return "❄️"; // Neve
        case 95:
        case 96:
        case 99:
            return "⛈️"; // Temporale
        default:
            return "🌡️";
    }
}

async function getCurrentWeather(latitude, longitude) {
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,is_day&timezone=auto&models=ecmwf_ifs025`
  );

  if (!response.ok) {
    throw new Error(`Errore API: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return {
    temperature: data.current.temperature_2m,
    weatherCode: data.current.weather_code,
    isDay: data.current.is_day === 1
  };
}



// Inizializza navigazione e carica dati
(async () => {
    await loadGinList();
    setupNavigationButtons();
    setupDragAndKeyboard();
    
    // Se torniamo dall'accesso diretto, non applicare transizione
    if (!isNavigationTransition) {
        clearNavTransition();
    }
})();

LoadBottle();
}); 


    
