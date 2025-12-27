import { initTheme, toggleTheme } from './utils.js';
import { initCustomCursor } from './cursor.js';
import { initDecorations } from './decorations.js';

// State
let projectsData = [];
let currentFilter = 'all';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initCustomCursor();
    initDecorations();
    setupThemeToggle();
    loadWorksData();
    setupFilters();
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
        // Adjust path if needed based on where the script is running
        const response = await fetch('data/works-data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        projectsData = data.projects;

        // Sort by date ascending (earliest first)
        projectsData.sort((a, b) => new Date(a.lastUpdated) - new Date(b.lastUpdated));
        
        renderWorks();
    } catch (error) {
        console.error('Failed to load works data:', error);
        worksList.innerHTML = `
            <div class="error">
                <p>Failed to load projects.</p>
                <p>Please check if data/works-data.json exists and is valid JSON.</p>
                <p>Error: ${error.message}</p>
            </div>
        `;
    }
}

// Setup Filter Buttons
function setupFilters() {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update filter and render
            currentFilter = btn.dataset.filter;
            renderWorks();
        });
    });
}

// Render Works List
function renderWorks() {
    const worksList = document.getElementById('works-list');
    worksList.innerHTML = '';

    const filteredProjects = projectsData.filter(project => {
        if (currentFilter === 'all') return true;
        return project.status === currentFilter;
    });

    if (filteredProjects.length === 0) {
        worksList.innerHTML = '<div class="loading">No projects found for this category.</div>';
        return;
    }

    filteredProjects.forEach(project => {
        const workItem = createWorkItem(project);
        worksList.appendChild(workItem);
    });
}

// Create HTML for a single work item
function createWorkItem(project) {
    const article = document.createElement('article');
    article.className = 'work-item';
    
    // Status Badge
    const statusClass = `status-${project.status}`;
    const statusText = project.status.replace('-', ' ');
    
    // Main Category (First Tag)
    const mainCategory = project.tags && project.tags.length > 0 ? project.tags[0] : '';
    const categoryHtml = mainCategory ? `<span class="work-category">${mainCategory}</span>` : '';
    
    // Progress Bar
    const progressHtml = `
        <div class="work-progress-container">
            <div class="progress-label">
                <span>Progress</span>
                <span>${project.progress}%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${project.progress}%"></div>
            </div>
        </div>
    `;

    // Tags
    const tagsHtml = project.tags.map(tag => `<span class="tag">${tag}</span>`).join('');

    // Tasks
    let tasksHtml = '';
    if (project.tasks && Array.isArray(project.tasks) && project.tasks.length > 0) {
        tasksHtml = '<div class="work-tasks">';
        tasksHtml += '<h4 class="tasks-title">Progress Details</h4>';
        tasksHtml += '<ul class="task-list">';
        project.tasks.forEach(task => {
            const statusClass = task.completed ? 'task-completed' : 'task-pending';
            const icon = task.completed ? '✓' : '○';
            tasksHtml += `
                <li class="task-item ${statusClass}">
                    <span class="task-icon">${icon}</span>
                    <span class="task-name">${task.name}</span>
                </li>
            `;
        });
        tasksHtml += '</ul></div>';
    }

    // Gallery (Thumbnail + Images + Twitter Embeds)
    let galleryItems = [];

    // 1. Main Thumbnail
    if (project.thumbnail) {
        galleryItems.push(`
            <div class="gallery-item">
                <img src="${project.thumbnail}" alt="${project.title}" loading="lazy">
            </div>
        `);
    }

    // 2. Process Links (Images & Twitter)
    let linksHtml = '';
    if (project.links && Array.isArray(project.links) && project.links.length > 0) {
        const otherLinks = [];
        
        project.links.forEach(link => {
            if (!link.url) return;

            // Check for Twitter/X URL
            const isTwitter = link.url.match(/https?:\/\/(twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/status\/\d+/);
            
            if (link.type === 'image') {
                galleryItems.push(`
                    <div class="gallery-item">
                        <img src="${link.url}" alt="${link.label || 'Image'}" loading="lazy">
                    </div>
                `);
            } else if (isTwitter) {
                // Convert to Twitter Embed
                // Replace x.com with twitter.com for compatibility with widgets.js
                const tweetUrl = link.url.replace('x.com', 'twitter.com');
                galleryItems.push(`
                    <div class="gallery-item gallery-embed">
                        <blockquote class="twitter-tweet" data-media-max-width="560" data-theme="dark">
                            <a href="${tweetUrl}"></a>
                        </blockquote>
                    </div>
                `);
            } else {
                otherLinks.push(link);
            }
        });

        // Build Links HTML for remaining links
        if (otherLinks.length > 0) {
            linksHtml = '<div class="work-links">';
            otherLinks.forEach(link => {
                linksHtml += `
                    <a href="${link.url}" class="work-link" target="_blank" rel="noopener noreferrer">
                        ${getLinkIcon(link.label)} ${link.label}
                    </a>
                `;
            });
            linksHtml += '</div>';
        }
    }

    const galleryHtml = galleryItems.length > 0 
        ? `<div class="work-gallery">${galleryItems.join('')}</div>` 
        : '';

    // Generate unique ID for accessibility
    const projectId = `project-${project.id || Math.random().toString(36).substr(2, 9)}`;
    const headerId = `${projectId}-header`;
    const contentId = `${projectId}-content`;

    article.innerHTML = `
        <header 
            class="work-header" 
            id="${headerId}"
            aria-expanded="false" 
            aria-controls="${contentId}"
            role="button" 
            tabindex="0"
            onclick="toggleAccordion(this)"
            onkeydown="handleKeydown(event, this)">
            <div class="header-content">
                <h2 class="work-title">${project.title}</h2>
                <div class="header-meta">
                    ${categoryHtml}
                    <div class="work-status ${statusClass}">${statusText}</div>
                </div>
            </div>
            <span class="work-date">${project.lastUpdated}</span>
        </header>

        ${progressHtml}

        <div 
            class="work-body" 
            id="${contentId}" 
            role="region" 
            aria-labelledby="${headerId}">
            ${galleryHtml}
            <div class="work-summary">${project.summary}</div>
            ${tasksHtml}
            <div class="work-details">${project.content}</div>
            
            <div class="work-tags">
                ${tagsHtml}
            </div>

            ${linksHtml}
        </div>
    `;

    return article;
}

// Load Twitter Widget Script if needed
function loadTwitterWidget() {
    if (!document.getElementById('twitter-wjs')) {
        const script = document.createElement('script');
        script.id = 'twitter-wjs';
        script.src = "https://platform.twitter.com/widgets.js";
        script.async = true;
        document.body.appendChild(script);
    } else if (window.twttr) {
        // If script already loaded, re-scan for new widgets
        window.twttr.widgets.load();
    }
}

// Accordion Toggle
window.toggleAccordion = function(header) {
    const item = header.closest('.work-item');
    const wasActive = item.classList.contains('active');
    
    // Close all other items
    document.querySelectorAll('.work-item').forEach(el => {
        el.classList.remove('active');
        const otherHeader = el.querySelector('.work-header');
        if (otherHeader) otherHeader.setAttribute('aria-expanded', 'false');
    });

    // Toggle current
    if (!wasActive) {
        item.classList.add('active');
        header.setAttribute('aria-expanded', 'true');
        // Load Twitter widgets when opening
        setTimeout(loadTwitterWidget, 100);
    } else {
        header.setAttribute('aria-expanded', 'false');
    }
};

// Keyboard accessibility
window.handleKeydown = function(event, header) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleAccordion(header);
    }
};

// Helper: Get icon for links (using simple text or emoji for now, can be SVG)
function getLinkIcon(label) {
    if (!label) return '🔗';
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes('github') || lowerLabel.includes('repo')) return '📦';
    if (lowerLabel.includes('demo') || lowerLabel.includes('site') || lowerLabel.includes('web')) return '🚀';
    if (lowerLabel.includes('design') || lowerLabel.includes('figma')) return '🎨';
    if (lowerLabel.includes('twitter') || lowerLabel.includes('x.com')) return '🐦';
    if (lowerLabel.includes('youtube') || lowerLabel.includes('video')) return '📺';
    return '🔗';
}

// Helper: Capitalize first letter
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
