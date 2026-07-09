const navScriptElement = document.currentScript || document.querySelector('script[src*="js/nav-bar.js"]');
const navScriptUrl = navScriptElement
	? new URL(navScriptElement.getAttribute('src') || navScriptElement.src, document.baseURI)
	: new URL('./js/nav-bar.js', document.baseURI);
const navBaseUrl = new URL('.', navScriptUrl.href);
const navLogoUrl = new URL('../assets/images/ginduneria_logo.png', navBaseUrl).href;
const homeUrl = new URL('../index.html', navBaseUrl).href;
const marketUrl = new URL('../markets.html', navBaseUrl).href;
const globeUrl = new URL('../globe.html', navBaseUrl).href;

document.addEventListener('DOMContentLoaded', () => {
	if (document.querySelector('[data-ginduneria-nav]')) {
		return;
	}

	const nav = document.createElement('header');
	nav.className = 'ginduneria-nav';
	nav.dataset.ginduneriaNav = 'true';
	nav.innerHTML = `
		<a class="ginduneria-nav__brand" href="${homeUrl}" aria-label="Vai alla Home">
			<img class="ginduneria-nav__logo" src="${navLogoUrl}" alt="Ginduneria Illegale">
			<span class="ginduneria-nav__copy">
				<strong>Ginduneria Illegale</strong>
			</span>
		</a>
		<button class="ginduneria-nav__toggle" type="button" aria-expanded="false" aria-controls="ginduneria-nav-menu">
			<span></span>
			<span></span>
			<span></span>
			<span class="sr-only">Apri menu</span>
		</button>
		<nav class="ginduneria-nav__menu" id="ginduneria-nav-menu" aria-label="Menu principale">
			<a href="${homeUrl}">Home</a>
			<a href="${globeUrl}">Mondo dei Gin</a>
			<a href="${marketUrl}">Stock Market 📈</a>
		</nav>
	`;

	const style = document.createElement('style');
	style.textContent = `
		:root { --ginduneria-nav-height: 84px; }
		body.has-ginduneria-nav { padding-top: var(--ginduneria-nav-height); }
		body.has-ginduneria-nav .view-toggle {
			top: calc(var(--ginduneria-nav-height) + 12px);
			z-index: 9999;
		}
		.ginduneria-nav {
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			z-index: 10000;
			height: var(--ginduneria-nav-height);
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 16px;
			padding: 14px 22px;
			background: rgba(5, 7, 8, 0.84);
			backdrop-filter: blur(16px);
			border-bottom: 1px solid rgba(255,255,255,0.08);
			box-shadow: 0 14px 40px rgba(0,0,0,0.24);
		}
		.ginduneria-nav__brand {
			display: inline-flex;
			align-items: center;
			gap: 12px;
			text-decoration: none;
			color: inherit;
			min-width: 0;
		}
		.ginduneria-nav__logo {
			width: 44px;
			height: 44px;
			object-fit: contain;
			border-radius: 12px;
			background: rgba(255,255,255,0.04);
		}
		.ginduneria-nav__copy {
			display: flex;
			flex-direction: column;
			line-height: 1.1;
		}
		.ginduneria-nav__copy strong {
			font-size: 0.96rem;
			letter-spacing: 0.08em;
			text-transform: uppercase;
		}
		.ginduneria-nav__copy small {
			color: rgba(238,242,244,0.62);
			font-size: 0.72rem;
			letter-spacing: 0.18em;
			text-transform: uppercase;
		}
		.ginduneria-nav__menu {
			display: flex;
			align-items: center;
			gap: 10px;
		}
		.ginduneria-nav__menu a {
			text-decoration: none;
			color: rgba(238,242,244,0.9);
			font-weight: 800;
			padding: 10px 14px;
			border-radius: 999px;
			transition: transform .18s ease, background-color .18s ease, border-color .18s ease;
		}
		.ginduneria-nav__menu a:hover {
			transform: translateY(-1px);
			background: rgba(255,255,255,0.05);
		}
		.ginduneria-nav__toggle {
			display: none;
			width: 48px;
			height: 48px;
			border-radius: 14px;
			border: 1px solid rgba(255,255,255,0.1);
			background: rgba(255,255,255,0.04);
			cursor: pointer;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			gap: 4px;
		}
		.ginduneria-nav__toggle span:not(.sr-only) {
			display: block;
			width: 18px;
			height: 2px;
			border-radius: 999px;
			background: rgba(238,242,244,0.92);
		}
		.sr-only {
			position: absolute;
			width: 1px;
			height: 1px;
			padding: 0;
			margin: -1px;
			overflow: hidden;
			clip: rect(0, 0, 0, 0);
			white-space: nowrap;
			border: 0;
		}
		@media (max-width: 860px) {
			:root { --ginduneria-nav-height: 72px; }
			.ginduneria-nav { padding: 12px 16px; }
			body.has-ginduneria-nav .view-toggle {
				top: calc(var(--ginduneria-nav-height) + 10px);
				left: 12px;
				right: 12px;
			}
			.ginduneria-nav__toggle { display: inline-flex; }
			.ginduneria-nav__menu {
				position: absolute;
				top: calc(var(--ginduneria-nav-height) - 2px);
				left: 16px;
				right: 16px;
				display: grid;
				gap: 8px;
				padding: 14px;
				border-radius: 20px;
				border: 1px solid rgba(255,255,255,0.08);
				background: rgba(6,8,10,0.96);
				box-shadow: 0 24px 60px rgba(0,0,0,0.32);
				opacity: 0;
				transform: translateY(-8px);
				pointer-events: none;
				transition: opacity .18s ease, transform .18s ease;
			}
			.ginduneria-nav.is-open .ginduneria-nav__menu {
				opacity: 1;
				transform: translateY(0);
				pointer-events: auto;
			}
			.ginduneria-nav__menu a {
				width: 100%;
			}
		}
	`;

	document.head.appendChild(style);
	document.body.classList.add('has-ginduneria-nav');
	document.body.prepend(nav);

	const toggle = nav.querySelector('.ginduneria-nav__toggle');
	const menu = nav.querySelector('.ginduneria-nav__menu');

	const setOpen = isOpen => {
		nav.classList.toggle('is-open', isOpen);
		toggle.setAttribute('aria-expanded', String(isOpen));
	};

	toggle.addEventListener('click', () => {
		setOpen(!nav.classList.contains('is-open'));
	});

	menu.querySelectorAll('a').forEach(link => {
		link.addEventListener('click', () => setOpen(false));
	});

	document.addEventListener('click', event => {
		if (!nav.contains(event.target)) {
			setOpen(false);
		}
	});

	window.addEventListener('resize', () => {
		if (window.innerWidth > 860) {
			setOpen(false);
		}
	});
});
