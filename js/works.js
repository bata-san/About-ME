import { initTheme, toggleTheme } from './utils.js';
import { initCustomCursor } from './cursor.js';
import { initDecorations } from './decorations.js';

// State
let projectsData = [];
let currentFilter = 'all';
let currentSort = 'date-desc';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initCustomCursor();
    initDecorations();
    setupThemeToggle();
    loadWorksData();
    setupControls();
});

function setupThemeToggle() {
    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleTheme);
    }
}

// Load Data
async function loadWorksData() {
    const worksList = document.getElementById('works-list');
    
    try {
        const response = await fetch('data/works-data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        projectsData = data.projects;
        
        renderWorks();
    } catch (error) {
        console.error('Failed to load works data:', error);
        worksList.innerHTML = `
            <div class="error-message">
                <p>Failed to load projects.</p>
                <p>Error: ${error.message}</p>
            </div>
        `;
    }
}

// Setup Controls (Filter & Sort)
function setupControls() {
    // Filters
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderWorks();
        });
    });

    // Sort
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            renderWorks();
        });
    }
}

// Render Works List
function renderWorks() {
    const worksList = document.getElementById('works-list');
    worksList.innerHTML = '';

    // 1. Filter
    let filtered = projectsData.filter(project => {
        if (currentFilter === 'all') return true;
        return project.status === currentFilter;
    });

    // 2. Sort
    filtered.sort((a, b) => {
        switch (currentSort) {
            case 'date-desc':
                return new Date(b.lastUpdated) - new Date(a.lastUpdated);
            case 'date-asc':
                return new Date(a.lastUpdated) - new Date(b.lastUpdated);
            case 'progress-desc':
                return (b.progress || 0) - (a.progress || 0);
            case 'progress-asc':
                return (a.progress || 0) - (b.progress || 0);
            default:
                return 0;
        }
    });

    if (filtered.length === 0) {
        worksList.innerHTML = '<div class="empty-state">No projects found.</div>';
        return;
    }

    filtered.forEach(project => {
        const workItem = createWorkCard(project);
        worksList.appendChild(workItem);
    });
    
    // Re-initialize Twitter widgets if any
    if (window.twttr) {
        window.twttr.widgets.load();
    } else {
        loadTwitterWidget();
    }
}

// Create HTML for a single work card
function createWorkCard(project) {
    const article = document.createElement('article');
    article.className = 'work-card';
    
    // Status Badge
    const statusText = project.status.replace('-', ' ');
    
    // Main Category
    const mainCategory = project.tags && project.tags.length > 0 ? project.tags[0] : 'Project';
    
    // Progress Bar
    const progressHtml = `
        <div class="card-progress">
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${project.progress}%"></div>
            </div>
            <span class="progress-text">${project.progress}%</span>
        </div>
    `;

    // Tags
    const tagsHtml = (project.tags || []).slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('');

    // Thumbnail (or placeholder)
    const thumbnailHtml = project.thumbnail 
        ? `<img src="${project.thumbnail}" alt="${project.title}" class="card-thumb" loading="lazy">`
        : `<div class="card-thumb-placeholder"><span>${mainCategory}</span></div>`;

    // Unique IDs
    const projectId = `project-${project.id || Math.random().toString(36).substr(2, 9)}`;
    const contentId = `${projectId}-content`;

    article.innerHTML = `
        <div class="card-header" onclick="toggleCard(this)" role="button" aria-expanded="false" aria-controls="${contentId}">
            <div class="card-image-wrapper">
                ${thumbnailHtml}
                <div class="card-status status-${project.status}">${statusText}</div>
            </div>
            <div class="card-info">
                <div class="card-meta">
                    <span class="card-category">${mainCategory}</span>
                    <span class="card-date">${project.lastUpdated}</span>
                </div>
                <h3 class="card-title">${project.title}</h3>
                <p class="card-summary">${project.summary || ''}</p>
                ${progressHtml}
                <div class="card-tags">${tagsHtml}</div>
            </div>
        </div>

        <div class="card-body" id="${contentId}" hidden>
            <div class="card-body-inner">
                <div class="work-details">${project.content || ''}</div>
                ${renderTasks(project.tasks)}
                ${renderLinks(project.links)}
            </div>
        </div>
    `;

    return article;
}

function renderTasks(tasks) {
    if (!tasks || !tasks.length) return '';
    
    const items = tasks.map(task => `
        <li class="task-item ${task.completed ? 'completed' : ''}">
            <span class="task-icon">${task.completed ? '✓' : '○'}</span>
            <span class="task-name">${task.name}</span>
        </li>
    `).join('');

    return `
        <div class="work-section">
            <h4 class="section-title">Tasks</h4>
            <ul class="task-list">${items}</ul>
        </div>
    `;
}

function renderLinks(links) {
    if (!links || !links.length) return '';

    const items = links.map(link => {
        if (link.type === 'image') {
            return `<img src="${link.url}" alt="${link.label}" class="detail-image" loading="lazy">`;
        }
        // Check for Twitter/X
        if (link.url.match(/https?:\/\/(twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/status\/\d+/)) {
             const tweetUrl = link.url.replace('x.com', 'twitter.com');
             return `
                <div class="detail-embed">
                    <blockquote class="twitter-tweet" data-media-max-width="560" data-theme="dark">
                        <a href="${tweetUrl}"></a>
                    </blockquote>
                </div>
             `;
        }
        return `
            <a href="${link.url}" class="detail-link" target="_blank" rel="noopener noreferrer">
                ${getLinkIcon(link.label)} ${link.label}
            </a>
        `;
    }).join('');

    return `<div class="work-section work-links">${items}</div>`;
}

// Global Toggle Function
window.toggleCard = function(header) {
    const card = header.closest('.work-card');
    const body = card.querySelector('.card-body');
    const isExpanded = header.getAttribute('aria-expanded') === 'true';

    // Close others (Accordion style) - Optional, maybe user wants multiple open?
    // Let's keep it exclusive for cleaner UI
    document.querySelectorAll('.work-card').forEach(c => {
        if (c !== card) {
            c.classList.remove('expanded');
            c.querySelector('.card-header').setAttribute('aria-expanded', 'false');
            c.querySelector('.card-body').hidden = true;
        }
    });

    if (isExpanded) {
        card.classList.remove('expanded');
        header.setAttribute('aria-expanded', 'false');
        body.hidden = true;
    } else {
        card.classList.add('expanded');
        header.setAttribute('aria-expanded', 'true');
        body.hidden = false;
        
        // Load Twitter widgets
        if (window.twttr) window.twttr.widgets.load();
    }
};

function loadTwitterWidget() {
    if (!document.getElementById('twitter-wjs')) {
        const script = document.createElement('script');
        script.id = 'twitter-wjs';
        script.src = "https://platform.twitter.com/widgets.js";
        script.async = true;
        document.body.appendChild(script);
    }
}

function getLinkIcon(label) {
    if (!label) return '🔗';
    const l = label.toLowerCase();
    if (l.includes('github')) return '📦';
    if (l.includes('demo') || l.includes('web')) return '🚀';
    if (l.includes('video') || l.includes('youtube')) return '📺';
    return '🔗';
}
