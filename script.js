// ── NO BUTTON FLOATING ──
const noBtn = document.getElementById('btn-no');
const inviteSection = document.getElementById('invite-section');
let noClickCount = 0;
const noCaptions = ['❌ No', '😒 Still No', '🙃 Nope', '😤 Absolutely not', '🥺 Please?', '😭 Fine... No', '👻 Ghost you then'];

function placeNoBtnRandom() {
    const margin = 80;
    const x = margin + Math.random() * (window.innerWidth - 2 * margin - 100);
    const y = margin + Math.random() * (window.innerHeight - 2 * margin - 60);
    noBtn.style.left = x + 'px';
    noBtn.style.top = y + 'px';
    noBtn.style.right = 'auto';
    noBtn.style.bottom = 'auto';
}

// Initial position near its natural spot
function initNoBtn() {
    const row = document.getElementById('btn-row');
    const rect = row.getBoundingClientRect();
    noBtn.style.left = (rect.right - 110) + 'px';
    noBtn.style.top = (rect.top + window.scrollY + 5) + 'px';
}

window.addEventListener('load', initNoBtn);
window.addEventListener('resize', initNoBtn);

noBtn.addEventListener('mouseover', placeNoBtnRandom);
noBtn.addEventListener('touchstart', (e) => { e.preventDefault(); placeNoBtnRandom(); }, { passive: false });

function handleNo() {
    noClickCount++;
    if (noClickCount < noCaptions.length) {
        noBtn.textContent = noCaptions[Math.min(noClickCount, noCaptions.length - 1)];
    }
    placeNoBtnRandom();
}

// ── ACCEPT ──
function acceptInvite() {
    const overlay = document.getElementById('party-overlay');
    overlay.classList.add('show');
    spawnConfetti();
}

function showMap() {
    const overlay = document.getElementById('party-overlay');
    overlay.classList.remove('show');
    document.getElementById('invite-section').style.display = 'none';
    noBtn.style.display = 'none';
    const mapSection = document.getElementById('map-section');
    mapSection.classList.add('visible');
    setTimeout(() => {
        initMapScroll();
        document.getElementById('legend').classList.add('visible');
    }, 100);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── CONFETTI ──
function spawnConfetti() {
    const emojis = ['🎉', '🎊', '✨', '🥳', '🎈', '⭐', '🌟', '🎁', '🎶'];
    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            const el = document.createElement('div');
            el.className = 'confetti-emoji';
            el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            el.style.left = Math.random() * 100 + 'vw';
            el.style.animationDuration = (2 + Math.random() * 2) + 's';
            el.style.animationDelay = '0s';
            document.body.appendChild(el);
            setTimeout(() => el.remove(), 4000);
        }, i * 80);
    }
}

// ── SCROLL-DRIVEN MAP ──
function initMapScroll() {
    const container = document.querySelector('.map-scroll-container');
    const svg = document.getElementById('campus-map-svg');
    const routePath = document.getElementById('route-path');
    const redDot = document.getElementById('red-dot');
    const dotGlow = document.getElementById('red-dot-glow');
    const trailPath = document.getElementById('route-trail');
    const progressBar = document.querySelector('.map-progress-bar');

    if (!routePath || !redDot || !svg) return;

    const totalLength = routePath.getTotalLength();

    // SVG full dimensions (vertically stretched for gradual reveal)
    const svgFullWidth = 700;
    const svgFullHeight = 2100;

    // Responsive viewBox — with the taller SVG, default 'meet' mode works
    // perfectly: full width fits the screen, only a portion of height visible
    const isMobile = window.innerWidth <= 600;
    const viewH = isMobile ? 1200 : 1050;
    const viewW = svgFullWidth;

    // Set initial viewBox to show the bottom (Entrance area)
    svg.setAttribute('viewBox', `0 ${svgFullHeight - viewH} ${viewW} ${viewH}`);

    // Set initial trail to hidden
    if (trailPath) {
        trailPath.style.strokeDasharray = totalLength;
        trailPath.style.strokeDashoffset = totalLength;
    }

    function updateDot() {
        const containerRect = container.getBoundingClientRect();
        const containerTop = containerRect.top + window.scrollY;
        const scrollableHeight = container.offsetHeight - window.innerHeight;

        // How far we've scrolled within the map container
        const scrolled = window.scrollY - containerTop;
        let progress = Math.max(0, Math.min(1, scrolled / scrollableHeight));

        // Get the current point on the route path
        const point = routePath.getPointAtLength(progress * totalLength);

        // ── PAN THE VIEWBOX ──
        // Center the viewBox vertically on the dot's Y position
        // This makes the dot appear to stay vertically fixed on screen
        // while the map scrolls past it. Only the dot's X (left) movement is visible.
        let viewY = point.y - viewH / 2;
        // Clamp so we don't go outside the SVG
        viewY = Math.max(0, Math.min(svgFullHeight - viewH, viewY));
        svg.setAttribute('viewBox', `0 ${viewY} ${viewW} ${viewH}`);

        // ── POSITION THE DOT ──
        redDot.setAttribute('cx', point.x);
        redDot.setAttribute('cy', point.y);

        if (dotGlow) {
            dotGlow.setAttribute('cx', point.x);
            dotGlow.setAttribute('cy', point.y);
        }

        // ── DRAW THE TRAIL ──
        if (trailPath) {
            trailPath.style.strokeDashoffset = totalLength - (progress * totalLength);
        }

        // ── PROGRESS BAR ──
        if (progressBar) {
            progressBar.style.height = (progress * 100) + '%';
        }
    }

    window.addEventListener('scroll', updateDot, { passive: true });
    updateDot(); // initial position — shows Entrance
}
