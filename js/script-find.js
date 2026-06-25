(function () {
    const track = document.querySelector('[data-carousel-track]');
    const viewport = document.querySelector('[data-carousel-viewport]');
    const dotsContainer = document.querySelector('[data-carousel-dots]');
    const prevButton = document.querySelector('[data-carousel-prev]');
    const nextButton = document.querySelector('[data-carousel-next]');
    const revealTargets = Array.from(document.querySelectorAll('[data-reveal]'));
    const pageNavLinks = Array.from(document.querySelectorAll('.page-nav__link'));

    if (!track || !viewport || !dotsContainer || !prevButton || !nextButton) {
        return;
    }

    const slides = Array.from(track.querySelectorAll('.carousel__slide'));
    const dots = [];
    let activeIndex = 0;
    let scrollTimer = null;

    if (revealTargets.length) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -8% 0px'
        });

        revealTargets.forEach((target) => revealObserver.observe(target));
    }

    if (pageNavLinks.length) {
        const sectionIds = pageNavLinks
            .map((link) => link.getAttribute('href'))
            .filter((href) => href && href.startsWith('#'))
            .map((href) => href.slice(1));

        const navTargets = sectionIds
            .map((id) => document.getElementById(id))
            .filter(Boolean);

        const setActiveNav = (id) => {
            pageNavLinks.forEach((link) => {
                const isActive = link.getAttribute('href') === `#${id}`;
                link.classList.toggle('is-active', isActive);
                if (isActive) {
                    link.setAttribute('aria-current', 'page');
                } else {
                    link.removeAttribute('aria-current');
                }
            });
        };

        if (navTargets.length) {
            const navObserver = new IntersectionObserver((entries) => {
                const visible = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

                if (visible) {
                    setActiveNav(visible.target.id);
                }
            }, {
                threshold: [0.25, 0.5, 0.75],
                rootMargin: '-18% 0px -58% 0px'
            });

            navTargets.forEach((target) => navObserver.observe(target));
            setActiveNav(navTargets[0].id);
        }
    }

    function clampIndex(index) {
        return Math.max(0, Math.min(slides.length - 1, index));
    }

    function scrollToSlide(index, behavior = 'smooth') {
        const nextIndex = clampIndex(index);
        activeIndex = nextIndex;
        const targetLeft = slides[nextIndex]?.offsetLeft ?? 0;
        track.scrollTo({ left: targetLeft, behavior });
        syncDots(nextIndex);
    }

    function syncDots(index) {
        dots.forEach((dot, dotIndex) => {
            const isActive = dotIndex === index;
            dot.setAttribute('aria-current', String(isActive));
            dot.tabIndex = isActive ? 0 : -1;
        });
    }

    function deriveIndexFromScroll() {
        const viewportCenter = track.scrollLeft + viewport.clientWidth / 2;
        let nextIndex = 0;
        let closestDistance = Number.POSITIVE_INFINITY;

        slides.forEach((slide, index) => {
            const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
            const distance = Math.abs(slideCenter - viewportCenter);

            if (distance < closestDistance) {
                closestDistance = distance;
                nextIndex = index;
            }
        });

        nextIndex = clampIndex(nextIndex);

        if (nextIndex !== activeIndex) {
            activeIndex = nextIndex;
            syncDots(nextIndex);
        }
    }

    function scheduleSync() {
        window.clearTimeout(scrollTimer);
        scrollTimer = window.setTimeout(deriveIndexFromScroll, 90);
    }

    function createDots() {
        slides.forEach((slide, index) => {
            const dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'carousel__dot';
            dot.setAttribute('aria-label', `Vai alla slide ${index + 1}`);
            dot.addEventListener('click', () => scrollToSlide(index));
            dotsContainer.appendChild(dot);
            dots.push(dot);
        });
        syncDots(0);
    }

    prevButton.addEventListener('click', () => {
        scrollToSlide(activeIndex - 1);
    });

    nextButton.addEventListener('click', () => {
        scrollToSlide(activeIndex + 1);
    });

    viewport.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            scrollToSlide(activeIndex - 1);
        }

        if (event.key === 'ArrowRight') {
            event.preventDefault();
            scrollToSlide(activeIndex + 1);
        }
    });

    track.addEventListener('scroll', scheduleSync, { passive: true });
    window.addEventListener('resize', () => scrollToSlide(activeIndex, 'auto'));

    createDots();

    // Parallax effect on scroll
    const parallaxElements = Array.from(document.querySelectorAll('[data-reveal]'));
    
    if (parallaxElements.length && window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
        let scrollPos = 0;
        
        window.addEventListener('scroll', () => {
            scrollPos = window.scrollY;
            
            parallaxElements.forEach((element, index) => {
                const elementTop = element.getBoundingClientRect().top + scrollPos;
                const elementHeight = element.offsetHeight;
                const viewportHeight = window.innerHeight;
                
                if (elementTop < scrollPos + viewportHeight && elementTop + elementHeight > scrollPos) {
                    const offset = (scrollPos - (elementTop - viewportHeight)) * 0.08;
                    element.style.setProperty('--parallax-offset', `${offset}px`);
                    element.style.transform = `translateY(var(--parallax-offset, 0))`;
                }
            });
        }, { passive: true });
    }

    // Enhance nav link interaction feedback
    pageNavLinks.forEach((link) => {
        link.addEventListener('click', () => {
            link.style.animation = 'none';
            setTimeout(() => {
                link.style.animation = '';
            }, 10);
        });
    });
})();