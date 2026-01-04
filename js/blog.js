import { initTheme, toggleTheme } from './utils.js';
import { initCustomCursor } from './cursor.js';
import { initDecorations } from './decorations.js';

// State
let blogPosts = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initCustomCursor();
    initDecorations();
    setupThemeToggle();
    
    // Initialize Blog
    loadBlogData();
    
    // Handle browser back/forward
    window.addEventListener('popstate', handleRouting);
    
    // Setup back button
    const backBtn = document.getElementById('back-to-list');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            history.pushState(null, '', 'blog.html');
            handleRouting();
        });
    }
});

function setupThemeToggle() {
    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleTheme);
    }
}

async function loadBlogData() {
    const listContainer = document.getElementById('blog-list-view');
    
    try {
        const response = await fetch('data/blog-data.json');
        if (!response.ok) throw new Error('Failed to load blog data');
        
        const data = await response.json();
        blogPosts = data.posts;
        
        // Sort by date desc
        blogPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        renderBlogList();
        handleRouting(); // Check URL on load
        
    } catch (error) {
        console.error(error);
        if (listContainer) {
            listContainer.innerHTML = '<p class="error">Failed to load posts.</p>';
        }
    }
}

function renderBlogList() {
    const listContainer = document.getElementById('blog-list-view');
    if (!listContainer) return;
    
    listContainer.innerHTML = '';
    
    blogPosts.forEach((post, index) => {
        const article = document.createElement('article');
        article.className = 'blog-card';
        article.style.animationDelay = `${index * 0.1}s`;
        article.innerHTML = `
            <div class="blog-meta">
                <time datetime="${post.date}">${post.date.replace(/-/g, '.')}</time>
                ${post.tags.map(tag => `<span class="blog-tag">${tag}</span>`).join('')}
            </div>
            <h2 class="blog-title">${post.title}</h2>
            <p class="blog-excerpt">${post.summary}</p>
            <a href="?id=${post.id}" class="read-more" data-id="${post.id}">Read Article -></a>
        `;
        
        // Add click event for SPA navigation
        const link = article.querySelector('.read-more');
        link.addEventListener('click', (e) => {
            e.preventDefault();
            history.pushState(null, '', `?id=${post.id}`);
            handleRouting();
        });
        
        listContainer.appendChild(article);
    });
}

function handleRouting() {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');
    
    const listView = document.getElementById('blog-list-view');
    const articleView = document.getElementById('blog-article-view');
    const pageHeader = document.querySelector('.page-header');
    
    if (!listView || !articleView) return;
    
    if (postId) {
        const post = blogPosts.find(p => p.id === postId);
        if (post) {
            renderArticle(post);
            listView.style.display = 'none';
            articleView.style.display = 'block';
            if (pageHeader) pageHeader.style.display = 'none'; // Hide main header in article view
            window.scrollTo(0, 0);
        } else {
            // Post not found, go back to list
            history.replaceState(null, '', 'blog.html');
            resetMeta();
            listView.style.display = 'flex';
            articleView.style.display = 'none';
            if (pageHeader) pageHeader.style.display = 'block';
        }
    } else {
        resetMeta();
        listView.style.display = 'flex';
        articleView.style.display = 'none';
        if (pageHeader) pageHeader.style.display = 'block';
    }
}

function resetMeta() {
    document.title = 'Blog - Portfolio of Butter';
    updateMetaDescription("Butter's Blog - Web Design, 3D Modeling, and Tech Notes.");
    updateMetaKeywords(['Butter', 'Portfolio', 'Blog', 'Web Design', '3D Modeling', 'Blender', 'UE5', 'JavaScript']);
}

function updateMetaDescription(content) {
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        document.head.appendChild(metaDesc);
    }
    metaDesc.content = content;
}

function updateMetaKeywords(tags) {
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.name = 'keywords';
        document.head.appendChild(metaKeywords);
    }
    // Combine base keywords with article tags
    const baseKeywords = ['Butter', 'Portfolio', 'Blog'];
    // Create unique set of keywords
    const uniqueKeywords = [...new Set([...baseKeywords, ...tags])];
    metaKeywords.content = uniqueKeywords.join(', ');
}

function renderArticle(post) {
    // Update SEO
    document.title = `${post.title} | Butter's Blog`;
    updateMetaDescription(post.summary);
    updateMetaKeywords(post.tags);

    document.getElementById('article-date').textContent = post.date.replace(/-/g, '.');
    document.getElementById('article-title').textContent = post.title;
    
    const tagsContainer = document.getElementById('article-tags');
    tagsContainer.innerHTML = post.tags.map(tag => `<span class="blog-tag">${tag}</span>`).join('');
    
    const thumbnail = document.getElementById('article-thumbnail');
    if (post.thumbnail) {
        thumbnail.src = post.thumbnail;
        thumbnail.style.display = 'block';
    } else {
        thumbnail.style.display = 'none';
    }
    
    document.getElementById('article-body').innerHTML = post.content;
}
