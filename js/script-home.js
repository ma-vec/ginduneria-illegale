(function() {
    const container = document.getElementById("container");
    const hero = document.getElementById("hero");
    
    const text2 = document.getElementById("text2");
    const text3 = document.getElementById("text3");
    const ctaText = document.getElementById("cta-text");
    const progressBar = document.getElementById("progressBar");

    const phrase2 = "Se cerchi qualcosa perché agli altri piace, esci pure, non voglio farti perdere tempo. Duna non ti porterà rancore.";
    const phrase3 = "Altrimenti continua a scorrere.";

    const words2 = phrase2.split(" ");
    const words3 = phrase3.split(" ");

    let scrollAccumulator = 0;
    const sensitivity = 45;
    let heroComplete = false;
    const totalWords = words2.length + words3.length;

    // Array per tenere traccia di tutti i video creati
    let ginVideos = [];

    // Funzione per creare le sezioni dinamicamente dal JSON
    async function createVideoSections() {
        try {
            const response = await fetch("data/gin_list.json");
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            // Rimuovi eventuali sezioni terroir esistenti
            const existingSections = document.querySelectorAll('.terroir');
            existingSections.forEach(section => section.remove());

            // Crea una sezione per ogni gin
            data.forEach((gin) => {
                // ===== SECTION =====
                const section = document.createElement("section");
                section.classList.add("terroir");
                section.setAttribute("data-gin-id", gin.id);
                section.setAttribute("data-gin-name", gin.name);

                // ===== VIDEO CONTAINER =====
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

                video.addEventListener('error', (e) => {
                    console.error(`Errore caricamento video per ${gin.id}:`, e);
                });

                videoContainer.appendChild(video);
                ginVideos.push(video);

                // ===== OVERLAY =====
                const overlay = document.createElement("div");
                overlay.classList.add("video-overlay");

                const glassOverlay = document.createElement("div");
                glassOverlay.classList.add("glass-overlay");

                // ===== AUDIO BADGE =====
                const audioBadge = document.createElement("div");
                audioBadge.classList.add("audio-badge");

                const icon = document.createElement("span");
                icon.classList.add("icon");
                icon.textContent = "🔊";

                const text = document.createElement("span");
                text.textContent = "Audio attivo";

                audioBadge.appendChild(icon);
                audioBadge.appendChild(text);

                // Toggle audio
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

                // ===== BOTTONE SVELA BOTTIGLIA =====
                const svelaBtn = document.createElement("button");
                svelaBtn.classList.add("btn-svela-bottiglia");
                
                const btnText = document.createTextNode("Svela "+gin.nome);
                svelaBtn.appendChild(btnText);

                // Variabili per il modale
                let modalOpen = false;
                let modal = null;
                let modalOverlay = null;

                // Funzione per chiudere il modale
                const closeModal = () => {
                    if (modal) {
                        modal.remove();
                        modal = null;
                    }
                    if (modalOverlay) {
                        modalOverlay.remove();
                        modalOverlay = null;
                    }
                    modalOpen = false;
                    
                    // Riattiva scroll
                    document.body.style.overflow = '';
                    document.documentElement.style.overflow = '';
                    
                    // Re-enabled scroll on container
                    if (container) {
                        container.style.overflowY = 'scroll';
                    }
                    
                    console.log('Modale chiuso');
                };

                // Evento click sul bottone Svela
                svelaBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    
                    console.log('Click su Svela per:', gin.id); // Debug
                    
                    if (modalOpen) {
                        closeModal();
                    } else {
                        // Chiudi eventuali altri modali aperti
                        document.querySelectorAll('.bottiglia-modal, .bottiglia-modal-overlay').forEach(el => el.remove());
                        
                        // Crea overlay per il modale
                        modalOverlay = document.createElement("div");
                        modalOverlay.classList.add("bottiglia-modal-overlay");
                        
                        // Crea modale per l'immagine
                        modal = document.createElement("div");
                        modal.classList.add("bottiglia-modal");

                        titleGin = document.createElement("h2");
                        titleGin.textContent=gin.nome;
                        modal.appendChild(titleGin);

                        br = document.createElement("br");
                        modal.appendChild(br);

                        placeGin = document.createElement("h4");
                        placeGin.textContent = gin.provenienza;
                        modal.appendChild(placeGin);
                        
                        // Aggiungi immagine della bottiglia
                        const img = document.createElement("img");
                        img.src = `./assets/images/${gin.id}.png`;
                        img.alt = gin.name;
                        img.loading = "lazy";
                        
                        // Gestione errore caricamento immagine
                        img.onerror = () => {
                            img.src = './assets/images/placeholder.png';
                            console.warn(`Immagine non trovata per ${gin.id}, uso placeholder`);
                        };
                        
                        // Gestione caricamento riuscito
                        img.onload = () => {
                            console.log(`Immagine ${gin.id} caricata con successo`);
                        };
                        
                        modal.appendChild(img);
                        
                        // Bottone chiusura
                        const closeBtn = document.createElement("div");
                        closeBtn.classList.add("bottiglia-close");
                        closeBtn.innerHTML = "×";
                        
                        closeBtn.addEventListener("click", (e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            closeModal();
                        });
                        
                        modal.appendChild(closeBtn);
                        
                        // Aggiungi alla sezione
                        section.appendChild(modalOverlay);
                        section.appendChild(modal);
                        
                        modalOpen = true;
                        
                        // Chiudi cliccando sull'overlay
                        modalOverlay.addEventListener("click", closeModal);
                        
                        // Previeni scroll del body quando il modale è aperto
                        document.body.style.overflow = 'hidden';
                        document.documentElement.style.overflow = 'hidden';
                        
                        // Disabilita scroll sul container
                        if (container) {
                            container.style.overflowY = 'hidden';
                        }
                        
                        console.log('Modale aperto per:', gin.id);
                    }
                });

                // ===== INTERSECTION OBSERVER =====
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            video.play().catch(error => {
                                console.log(`Riproduzione video ${gin.id}:`, error);
                                if (error.name === 'NotAllowedError') {
                                    video.muted = true;
                                    video.play().catch(e => console.log("Ancora bloccato:", e));
                                }
                            });
                        } else {
                            video.pause();
                            // Chiudi il modale se aperto quando si esce dalla sezione
                            if (modalOpen) {
                                closeModal();
                            }
                        }
                    });
                }, { threshold: 0.3 });

                observer.observe(section);

                // ===== APPEND TUTTO =====
                section.appendChild(videoContainer);
                section.appendChild(overlay);
                section.appendChild(glassOverlay);
                section.appendChild(audioBadge);
                section.appendChild(svelaBtn);
                container.appendChild(section);

                // Tenta di avviare il video
                video.play().catch(() => {});
            });

            console.log(`Create ${data.length} sezioni gin`);

        } catch (err) {
            console.error("Errore caricamento gin:", err);
            const fallbackMsg = document.createElement('div');
            fallbackMsg.style.cssText = 'color: white; text-align: center; padding: 20px;';
            fallbackMsg.textContent = 'Errore nel caricamento dei gin. Riprova più tardi.';
            container.appendChild(fallbackMsg);
        }
    }

    // Chiama la funzione al caricamento
    createVideoSections();

    // Effetto luce che segue il mouse sull'hero
    hero.addEventListener("mousemove", (e) => {
        const rect = hero.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        hero.style.setProperty('--x', `${x}%`);
        hero.style.setProperty('--y', `${y}%`);
    });

    // Funzione per aggiornare il testo progressivo
    function updateTextDisplay() {
        const currentWordIndex = Math.floor(scrollAccumulator / sensitivity);
        
        const percent = Math.min((scrollAccumulator / (sensitivity * totalWords)) * 100, 100);
        progressBar.style.width = percent + "%";

        if (currentWordIndex <= words2.length) {
            text2.innerHTML = words2.slice(0, currentWordIndex).join(" ");
            text2.classList.add('fade');
            text3.innerHTML = "";
            ctaText.style.display = "none";
        } 
        else if (currentWordIndex <= totalWords) {
            const index3 = currentWordIndex - words2.length;
            text2.innerHTML = words2.join(" ");
            text3.innerHTML = words3.slice(0, index3).join(" ");
            text3.classList.add('fade');
            ctaText.style.display = "none";
        } 
        else if (!heroComplete) {
            heroComplete = true;
            text2.innerHTML = words2.join(" ");
            text3.innerHTML = words3.join(" ");
            ctaText.style.display = "inline-block";
            progressBar.style.width = "100%";
            
            // Dopo un breve delay, scrolla alla prima sezione gin
            setTimeout(() => {
                container.scrollTo({ 
                    top: window.innerHeight, 
                    behavior: 'smooth' 
                });
            }, 800);
        }
    }

    // Gestione scroll per la hero
    let ticking = false;
    window.addEventListener("wheel", (e) => {
        if (heroComplete) return;
        
        // Blocca lo scroll fisico solo se siamo sulla hero
        if (container.scrollTop < 10) {
            e.preventDefault();
        }
        
        scrollAccumulator += Math.abs(e.deltaY) * 0.5;
        
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateTextDisplay();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: false });

    // Reset quando si torna all'hero
    container.addEventListener("scroll", () => {
        if (container.scrollTop === 0) {
            heroComplete = false;
            scrollAccumulator = 0;
            text2.innerHTML = "";
            text3.innerHTML = "";
            ctaText.style.display = "none";
            progressBar.style.width = "0%";
            text2.classList.remove('fade');
            text3.classList.remove('fade');
            
            // Ferma tutti i video quando si torna alla hero
            ginVideos.forEach(video => {
                video.pause();
            });
            
            // Riattiva scroll se era bloccato
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
            container.style.overflowY = 'scroll';
        }
    });

    // Supporto touch per mobile
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

    // Aggiungi supporto tasto ESC per chiudere il modale
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // Cerca tutti i modali aperti e chiudili
            const openModals = document.querySelectorAll('.bottiglia-modal');
            const openOverlays = document.querySelectorAll('.bottiglia-modal-overlay');
            
            openModals.forEach(modal => modal.remove());
            openOverlays.forEach(overlay => overlay.remove());
            
            // Riattiva scroll
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
            container.style.overflowY = 'scroll';
        }
    });

})();