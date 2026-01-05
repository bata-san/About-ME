
const LASTFM_API_KEY = '4000c22e2a41c9a91eca6f9f5874da75'; // Replace with your Last.fm API Key
const LASTFM_USERNAME = 'Butter_sandwich'; // Replace with your Last.fm Username
const REFRESH_INTERVAL = 15000; // 15 seconds

let intervalId = null;

export async function initLastFm() {
    const container = document.getElementById('lastfm-container');
    if (!container) return;

    if (LASTFM_API_KEY === 'YOUR_API_KEY' || LASTFM_USERNAME === 'YOUR_USERNAME') {
        container.innerHTML = '<div class="lastfm-error">CONFIG REQUIRED</div>';
        return;
    }

    const fetchData = async () => {
        if (document.hidden) return;

        try {
            const response = await fetch(`https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${LASTFM_USERNAME}&api_key=${LASTFM_API_KEY}&format=json&limit=5`);
            if (!response.ok) throw new Error('Network response was not ok');
            
            const data = await response.json();
            const tracks = data.recenttracks.track;
            
            if (tracks && tracks.length > 0) {
                renderLastFmWidget(container, tracks);
            } else {
                container.innerHTML = '<div class="lastfm-empty">NO SIGNAL</div>';
            }
        } catch (error) {
            console.error('Error fetching Last.fm data:', error);
            // Only show error if container is empty or has error
            if (!container.querySelector('.current-track')) {
                container.innerHTML = '<div class="lastfm-error">SIGNAL LOST</div>';
            }
        }
    };

    // Initial fetch
    fetchData();

    // Setup polling
    const startPolling = () => {
        if (intervalId) clearInterval(intervalId);
        intervalId = setInterval(fetchData, REFRESH_INTERVAL);
    };

    const stopPolling = () => {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
    };

    startPolling();

    // Optimize: Stop polling when tab is not visible
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopPolling();
        } else {
            fetchData(); // Update immediately when returning
            startPolling();
        }
    });
}

function renderLastFmWidget(container, tracks) {
    const currentTrack = tracks[0];
    const historyTracks = tracks.slice(1);

    const isNowPlaying = currentTrack['@attr'] && currentTrack['@attr'].nowplaying === 'true';
    const statusText = isNowPlaying ? 'NOW PLAYING' : 'LAST PLAYED';
    
    // Main Track HTML
    const imageUrl = getTrackImage(currentTrack);
    const mainTrackHtml = `
        <a href="${currentTrack.url}" target="_blank" rel="noopener noreferrer" class="current-track">
            <div class="track-art">
                ${imageUrl ? `<img src="${imageUrl}" alt="Album Art">` : '<div class="no-art"></div>'}
            </div>
            <div class="track-info">
                <div class="track-status">
                    <span class="status-dot ${isNowPlaying ? 'active' : ''}"></span>
                    ${statusText}
                    ${isNowPlaying ? '<div class="mini-equalizer"><span></span><span></span><span></span></div>' : ''}
                </div>
                <div class="track-name">${currentTrack.name}</div>
                <div class="track-artist">${currentTrack.artist['#text']}</div>
            </div>
        </a>
    `;

    // History List HTML
    const historyHtml = historyTracks.map(track => `
        <a href="${track.url}" target="_blank" rel="noopener noreferrer" class="history-item">
            <div class="history-time">${formatTime(track.date ? track.date.uts : Date.now() / 1000)}</div>
            <div class="history-info">
                <span class="history-name">${track.name}</span>
                <span class="history-artist">${track.artist['#text']}</span>
            </div>
        </a>
    `).join('');

    container.innerHTML = `
        ${mainTrackHtml}
        <div class="history-list">
            <div class="history-label">RECENT LOGS</div>
            ${historyHtml}
        </div>
    `;
}

function formatTime(uts) {
    const date = new Date(uts * 1000);
    const now = new Date();
    const diff = (now - date) / 1000; // seconds

    if (diff < 60) return 'NOW';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${date.getMonth() + 1}/${date.getDate()}`;
}

function getTrackImage(track) {
    if (!track.image) return null;
    // Try to get extralarge, then large
    const sizes = ['extralarge', 'large', 'medium', 'small'];
    for (const size of sizes) {
        const img = track.image.find(i => i.size === size);
        if (img && img['#text']) return img['#text'];
    }
    return null;
}
