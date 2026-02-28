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

    const indianColor = "#DAA520";
    const mediterraneanColor = "#0495CE";
    let radarChartInstance;

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

            const ginObj = data.find(g => g.id === ginId);

            if (!ginObj) {
                alert("Bottiglia non trovata");
                return;
            }

            nome.textContent = ginObj.nome;
            pos.textContent = ginObj.provenienza;
            bottleImage.src = `assets/images/${ginObj.id}.png`;

            botanic.textContent = ginObj.botaniche.join(", ");
            aggettivi.textContent = ginObj.aggettivi.join(", ");

            bottleImage.alt = `Immagine di ${ginObj.nome}`;
            profile.textContent = ginObj.profilo;

            // Set the gin's brand color as CSS variable for the gradient
            document.documentElement.style.setProperty('--gin-color', ginObj["bg-color"]);

            // Mini-map decorativa
            LoadMiniMap(ginObj);

            LoadRadar(ginObj);

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
                ctx.fillText(value, point.x, point.y + offset); // posiziona sopra o sotto il punto a seconda del dataset
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
                    ticks: {
                        display: false
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
    // Skip on narrow screens (CSS hides it, but avoid init overhead)
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

LoadBottle();
}); 


    
