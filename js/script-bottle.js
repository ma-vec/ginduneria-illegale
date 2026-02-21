document.addEventListener("DOMContentLoaded", () => {

    const params = new URLSearchParams(window.location.search);
    const ginId = params.get("id");

    const nome = document.getElementById("nome-bottiglia");
    const pos = document.getElementById("pos");
    const botanic = document.getElementById("botanic");
    const aggettivi = document.getElementById("aggettivi");
    const bottleImage = document.getElementById("bottle-image");
    const profile = document.getElementById("profile");

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

        } catch (err) {
            console.error(err);
            alert("Errore nel caricamento: " + err.message);
        }
    }

    LoadBottle();
});