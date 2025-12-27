/**
 * Decorative System Elements (HUD)
 * Adds "meaningful" but purely decorative elements to the interface.
 * - FPS: Real-time rendering performance.
 * - Theme Status: Shows current system mode (Light/Dark).
 * - Coordinates: Real-time cursor tracking.
 * - Resolution: Current viewport dimensions.
 */

export function initDecorations() {
    // Create HUD Container
    const hud = document.createElement('div');
    hud.className = 'hud-layer';
    
    hud.innerHTML = `
        <div class="hud-item top-left">
            <span class="hud-label">FPS</span>
            <span class="hud-value" id="hud-fps">60</span>
        </div>
        <div class="hud-item top-right">
            <span class="hud-label">THEME</span>
            <span class="hud-value" id="hud-theme">AUTO</span>
        </div>
        <div class="hud-item bottom-left">
            <span class="hud-label">POS</span>
            <span class="hud-value" id="hud-coords">0000 : 0000</span>
        </div>
        <div class="hud-item bottom-center">
            <span class="hud-label">RES</span>
            <span class="hud-value" id="hud-res">0000 x 0000</span>
        </div>
        <div class="hud-item bottom-right">
            <span class="hud-label">VISITS</span>
            <span class="hud-value" id="hud-visits">000000</span>
        </div>
    `;
    
    document.body.appendChild(hud);

    // FPS Counter
    const fpsEl = document.getElementById('hud-fps');
    let lastTime = performance.now();
    let frames = 0;
    
    function updateFPS() {
        const now = performance.now();
        frames++;
        
        if (now - lastTime >= 1000) {
            if (fpsEl) fpsEl.textContent = frames;
            frames = 0;
            lastTime = now;
        }
        
        requestAnimationFrame(updateFPS);
    }
    updateFPS();

    // Coordinate Tracking
    const coordsEl = document.getElementById('hud-coords');
    window.addEventListener('mousemove', (e) => {
        if (coordsEl) {
            const x = e.clientX.toString().padStart(4, '0');
            const y = e.clientY.toString().padStart(4, '0');
            coordsEl.textContent = `${x} : ${y}`;
        }
    });

    // Theme Status Tracking
    const updateThemeDisplay = () => {
        const theme = document.documentElement.getAttribute('data-theme') || 'light';
        const themeEl = document.getElementById('hud-theme');
        if (themeEl) themeEl.textContent = theme.toUpperCase();
    };
    
    // Watch for theme changes
    const observer = new MutationObserver(updateThemeDisplay);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    updateThemeDisplay(); // Initial check

    // Resolution Tracking
    const resEl = document.getElementById('hud-res');
    const updateRes = () => {
        if (resEl) {
            const w = window.innerWidth.toString().padStart(4, '0');
            const h = window.innerHeight.toString().padStart(4, '0');
            resEl.textContent = `${w} x ${h}`;
        }
    };
    
    window.addEventListener('resize', updateRes);
    updateRes(); // Initial check

    // Visit Counter (Decorative)
    const visitsEl = document.getElementById('hud-visits');
    if (visitsEl) {
        // Try to fetch from Cloudflare Pages Function (Stateless)
        fetch('/api/visits')
            .then(res => {
                if (!res.ok) throw new Error('API not available');
                return res.json();
            })
            .then(data => {
                if (data.count) {
                    visitsEl.textContent = data.count.toString().padStart(6, '0');
                }
            })
            .catch(() => {
                // Fallback: Local Simulation (for local dev or if API fails)
                const STORAGE_KEY = 'portfolio_visit_count';
                const BASE_COUNT = 4096;
                
                let count = parseInt(localStorage.getItem(STORAGE_KEY) || '0');
                
                // Increment on every load to show activity
                count++;
                localStorage.setItem(STORAGE_KEY, count.toString());

                const displayCount = (BASE_COUNT + count).toString().padStart(6, '0');
                visitsEl.textContent = displayCount;
            });
    }

    // Easter Egg: Konami Code
    // Up, Up, Down, Down, Left, Right, Left, Right, B, A
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiIndex = 0;

    document.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === konamiCode[konamiIndex].toLowerCase()) {
            konamiIndex++;
            if (konamiIndex === konamiCode.length) {
                activateEasterEgg();
                konamiIndex = 0;
            }
        } else {
            konamiIndex = 0;
        }
    });

    function activateEasterEgg() {
        // Visual feedback
        document.documentElement.style.setProperty('--text-primary', '#00ff00');
        document.documentElement.style.setProperty('--bg-primary', '#000000');
        document.documentElement.style.setProperty('--bg-secondary', '#0a0a0a');
        document.documentElement.style.setProperty('--signal-red', '#00ff00');
        
        // Change HUD text
        const themeEl = document.getElementById('hud-theme');
        if (themeEl) themeEl.textContent = 'HACKER';
        
        const fpsEl = document.getElementById('hud-fps');
        if (fpsEl) fpsEl.textContent = '999';

        // Matrix Rain Effect
        const canvas = document.createElement('canvas');
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.zIndex = '0'; // Behind content
        canvas.style.opacity = '0.3';
        canvas.style.pointerEvents = 'none';
        document.body.prepend(canvas);

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const chars = '01';
        const fontSize = 14;
        const columns = canvas.width / fontSize;
        const drops = Array(Math.floor(columns)).fill(1);

        function drawMatrix() {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#0f0';
            ctx.font = `${fontSize}px monospace`;

            for (let i = 0; i < drops.length; i++) {
                const text = chars.charAt(Math.floor(Math.random() * chars.length));
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);

                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
            requestAnimationFrame(drawMatrix);
        }
        drawMatrix();
    }
}
