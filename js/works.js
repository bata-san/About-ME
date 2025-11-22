import { initTheme, toggleTheme } from './utils.js';

// State
let projectsData = [];
let currentFilter = 'all';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
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
    const tagsHtml = project.tags.map(tag => `<span class="tag">#${tag}</span>`).join('');

    // Links
    let linksHtml = '';
    if (project.links && Object.keys(project.links).length > 0) {
        linksHtml = '<div class="work-links">';
        for (const [key, url] of Object.entries(project.links)) {
            if (url) {
                linksHtml += `
                    <a href="${url}" class="work-link" target="_blank" rel="noopener noreferrer">
                        ${getLinkIcon(key)} ${capitalize(key)}
                    </a>
                `;
            }
        }
        linksHtml += '</div>';
    }

    article.innerHTML = `
        <div class="work-status ${statusClass}">${statusText}</div>
        
        <header class="work-header" onclick="toggleAccordion(this)">
            <span class="work-date">Last updated: ${project.lastUpdated}</span>
            <h2 class="work-title">${project.title}</h2>
        </header>

        ${progressHtml}

        <div class="work-body">
            <div class="work-summary">${project.summary}</div>
            <div class="work-details">${project.content}</div>
            
            <div class="work-tags">
                ${tagsHtml}
            </div>

            ${linksHtml}
        </div>
    `;

    return article;
}

// Accordion Toggle
window.toggleAccordion = function(header) {
    const item = header.closest('.work-item');
    const wasActive = item.classList.contains('active');
    
    // Close all other items (optional - remove if you want multiple open)
    document.querySelectorAll('.work-item').forEach(el => {
        el.classList.remove('active');
    });

    // Toggle current
    if (!wasActive) {
        item.classList.add('active');
    }
};

// Helper: Get icon for links (using simple text or emoji for now, can be SVG)
function getLinkIcon(type) {
    const icons = {
        github: '📦',
        demo: '🚀',
        design: '🎨',
        docs: '📄'
    };
    return icons[type] || '🔗';
}

// Helper: Capitalize first letter
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
