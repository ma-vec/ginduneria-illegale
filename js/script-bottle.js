document.addEventListener("DOMContentLoaded", () => {

    const params = new URLSearchParams(window.location.search);
    const ginId = params.get("id");

    const nome = document.getElementById("nome-bottiglia");
    const pos = document.getElementById("pos");
    const botanic = document.getElementById("botanic");
    const aggettivi = document.getElementById("aggettivi");
    const bottleImage = document.getElementById("bottle-image");
    const profile = document.getElementById("profile");

    //colori radar
    const axisColors = {
    dryness: "rgba(210,180,140,0.8)",         // sabbia
    uniqueness: "rgba(200,170,80,0.8)",       // oro
    balsamic: "rgba(34,139,34,0.8)",          // verde scuro
    salinity: "rgba(0,160,220,0.8)",          // azzurro
    citrus: "rgba(255,180,0,0.8)",            // arancio
    "botanic-complexity": "rgba(0,180,100,0.8)", // verde brillante
    persistence: "rgba(150,120,255,0.8)"      // viola tenue
    };

    async function LoadBottle() {

        if (!ginId) {
            alert("ID bottiglia non fornito nella URL");
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

            LoadRadar(ginObj);

        } catch (err) {
            console.error(err);
            alert("Errore nel caricamento: " + err.message);
        }
    }
    
    // Carica il grafico radar
    function LoadRadar(obj) {
    const canvas = document.getElementById('radar-chart');
    const ctx = canvas.getContext('2d');

    const labels = [
        "Dryness",
        "Uniqueness",
        "Balsamic",
        "Salinity",
        "Citrus",
        "Botanic",
        "Persistence"
    ];

    const values = [
        obj.radar.dryness,
        obj.radar.uniqueness,
        obj.radar.balsamic,
        obj.radar.salinity,
        obj.radar.citrus,
        obj.radar["botanic-complexity"],
        obj.radar.persistence
    ];

    const axisColors = [
        "210,180,140",   // dryness
        "200,170,80",    // uniqueness
        "34,139,34",     // balsamic
        "0,160,220",     // salinity
        "255,180,0",     // citrus
        "0,180,100",     // botanic
        "150,120,255"    // persistence
    ];

    const gradientPlugin = {
        id: 'customRadarGradient',
        afterDatasetsDraw(chart) {

            const {ctx} = chart;
            const meta = chart.getDatasetMeta(0);
            const points = meta.data;

            const centerX = chart.scales.r.xCenter;
            const centerY = chart.scales.r.yCenter;

            ctx.save();

            for (let i = 0; i < points.length; i++) {

                const p1 = points[i];
                const p2 = points[(i + 1) % points.length];

                const gradient = ctx.createRadialGradient(
                    centerX,
                    centerY,
                    0,
                    p1.x,
                    p1.y,
                    150
                );

                gradient.addColorStop(0, `rgba(${axisColors[i]}, 0.05)`);
                gradient.addColorStop(1, `rgba(${axisColors[i]}, 0.8)`);

                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.lineTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.closePath();

                ctx.fillStyle = gradient;
                ctx.fill();
            }

            ctx.restore();
        }
    };

    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                borderColor: "#d4af37",
                borderWidth: 2,
                pointRadius: 3,
                pointBackgroundColor: "#d4af37",
                fill: false
            }]
        },
        options: {
            responsive: true,
            scales: {
                r: {
                    min: 0,
                    max: 10,
                    ticks: { display: false },
                    grid: { color: "rgba(255,255,255,0.08)" },
                    angleLines: { color: "rgba(255,255,255,0.15)" },
                    pointLabels: {
                        color: "#d4af37",
                        font: {
                            size: 13,
                            weight: 500
                        }
                    }
                }
            },
            plugins: {
                legend: { display: false }
            }
        },
        plugins: [gradientPlugin]
    });
    }
      LoadBottle();  
});

    
