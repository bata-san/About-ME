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
        const STORAGE_KEY = 'portfolio_visit_count';
        const BASE_COUNT = 4096;
        
        let count = parseInt(localStorage.getItem(STORAGE_KEY) || '0');
        // Only increment if not already incremented in this session (optional, but simple increment is fine for decoration)
        // For now, we just read it. The increment logic was in main.js, we'll move it here.
        
        // Check if we should increment (simple check: session storage flag)
        if (!sessionStorage.getItem('visit_incremented')) {
            count++;
            localStorage.setItem(STORAGE_KEY, count.toString());
            sessionStorage.setItem('visit_incremented', 'true');
        }

        const displayCount = (BASE_COUNT + count).toString().padStart(6, '0');
        visitsEl.textContent = displayCount;
    }
}
