/**
 * Discord Status Sync using Lanyard API
 * https://github.com/Phineas/lanyard
 */

// REPLACE THIS WITH YOUR DISCORD USER ID
const DISCORD_USER_ID = '1069090920856821760'; 

const STATUS_COLORS = {
    online: '#3ba55c',
    idle: '#faa61a',
    dnd: '#ed4245',
    offline: '#747f8d'
};

const STATUS_TEXT = {
    online: 'Online',
    idle: 'Idle',
    dnd: 'Do Not Disturb',
    offline: 'Offline'
};

export function initDiscordStatus() {
    const indicator = document.getElementById('discord-status-indicator');
    const text = document.getElementById('discord-status-text');
    
    if (!indicator || !text) return;

    // If user hasn't set their ID yet
    if (DISCORD_USER_ID === 'YOUR_DISCORD_ID_HERE') {
        text.textContent = 'Set Discord ID';
        indicator.style.backgroundColor = STATUS_COLORS.offline;
        console.warn('Please set your DISCORD_USER_ID in js/discord.js');
        return;
    }

    // Connect to Lanyard WebSocket
    connectLanyard(indicator, text);
}

function connectLanyard(indicator, text) {
    const ws = new WebSocket('wss://api.lanyard.rest/socket');

    ws.onopen = () => {
        // Subscribe to updates
        ws.send(JSON.stringify({
            op: 2,
            d: {
                subscribe_to_id: DISCORD_USER_ID
            }
        }));
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const { t, d } = data;

        if (t === 'INIT_STATE' || t === 'PRESENCE_UPDATE') {
            updateStatusUI(d, indicator, text);
        }
    };

    ws.onclose = () => {
        // Reconnect after 5 seconds
        setTimeout(() => connectLanyard(indicator, text), 5000);
    };
}

function updateStatusUI(data, indicator, text) {
    const status = data.discord_status;
    const activities = data.activities;
    
    // Update Indicator Color
    indicator.style.backgroundColor = STATUS_COLORS[status] || STATUS_COLORS.offline;
    // indicator.style.boxShadow = `0 0 8px ${STATUS_COLORS[status] || STATUS_COLORS.offline}`; // Removed for Matte Entity style

    // Update Text
    // Priority: Custom Status > Activity > Base Status
    let statusMessage = STATUS_TEXT[status];

    // Check for VS Code or other activities
    const vscode = activities.find(a => a.name === 'Visual Studio Code');
    const spotify = activities.find(a => a.name === 'Spotify');
    const custom = activities.find(a => a.type === 4); // Custom status

    if (vscode) {
        statusMessage = `Coding in VS Code`;
        if (vscode.details) statusMessage = vscode.details;
    } else if (spotify) {
        statusMessage = `Listening to Spotify`;
    } else if (custom && custom.state) {
        statusMessage = custom.state;
    }

    text.textContent = statusMessage;
    
    // Add fade in effect
    text.style.opacity = 0;
    requestAnimationFrame(() => {
        text.style.transition = 'opacity 0.3s ease';
        text.style.opacity = 1;
    });
}
