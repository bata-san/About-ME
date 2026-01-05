
let currentMode = 'works'; // 'works' or 'blog'
let currentId = null;
let appData = {
    works: [],
    blog: []
};

document.addEventListener('DOMContentLoaded', () => {
    // Initial Load
    loadAllData();

    // Mode Switchers
    document.getElementById('mode-works').addEventListener('click', () => switchMode('works'));
    document.getElementById('mode-blog').addEventListener('click', () => switchMode('blog'));

    // Actions
    document.getElementById('add-btn').addEventListener('click', createNewItem);
    document.getElementById('delete-btn').addEventListener('click', deleteItem);
    document.getElementById('save-btn').addEventListener('click', saveToServer);
    document.getElementById('load-btn').addEventListener('click', loadAllData);
    
    // Form Helpers
    document.getElementById('add-link-btn').addEventListener('click', () => addLinkField());
    document.getElementById('add-task-btn').addEventListener('click', () => addTaskField());
    document.getElementById('copy-json-btn').addEventListener('click', copyJson);
});

async function loadAllData() {
    try {
        // Load Works
        const worksRes = await fetch('data/works-data.json');
        if (worksRes.ok) {
            const json = await worksRes.json();
            appData.works = json.projects || [];
        }

        // Load Blog
        const blogRes = await fetch('data/blog-data.json');
        if (blogRes.ok) {
            const json = await blogRes.json();
            appData.blog = json.posts || [];
        }

        renderList();
        if (getList().length > 0) {
            selectItem(getList()[0].id);
        } else {
            createNewItem();
        }
        updateJsonPreview();

    } catch (e) {
        console.error("Error loading data:", e);
        alert("Error loading data. Check console.");
    }
}

function switchMode(mode) {
    currentMode = mode;
    
    // Update UI Buttons
    document.getElementById('mode-works').classList.toggle('active', mode === 'works');
    document.getElementById('mode-works').classList.toggle('btn-primary', mode === 'works');
    document.getElementById('mode-blog').classList.toggle('active', mode === 'blog');
    document.getElementById('mode-blog').classList.toggle('btn-primary', mode === 'blog');

    // Toggle Form Fields
    document.querySelectorAll('.field-works').forEach(el => el.classList.toggle('hidden', mode !== 'works'));
    document.querySelectorAll('.field-blog').forEach(el => el.classList.toggle('hidden', mode !== 'blog'));

    // Reset Selection
    renderList();
    const list = getList();
    if (list.length > 0) {
        selectItem(list[0].id);
    } else {
        createNewItem();
    }
    updateJsonPreview();
}

function getList() {
    return currentMode === 'works' ? appData.works : appData.blog;
}

function renderList() {
    const listContainer = document.getElementById('content-list');
    listContainer.innerHTML = '';
    const list = getList();

    // Sort by ID desc (newest first) usually, or by date
    // For now, just render as is
    const sortedList = [...list].reverse(); 

    sortedList.forEach(item => {
        const div = document.createElement('div');
        div.className = `project-item ${item.id === currentId ? 'active' : ''}`;
        div.onclick = () => selectItem(item.id);
        
        let meta = '';
        if (currentMode === 'works') {
            meta = `<span>${item.status}</span> • <span>${item.lastUpdated}</span>`;
        } else {
            meta = `<span>${item.date}</span>`;
        }

        div.innerHTML = `
            <div class="project-item-title">${item.title || 'Untitled'}</div>
            <div class="project-item-meta">${meta}</div>
        `;
        listContainer.appendChild(div);
    });
}

function selectItem(id) {
    currentId = id;
    const list = getList();
    const item = list.find(i => i.id === id);
    if (!item) return;

    renderList(); // Update active class

    const form = document.getElementById('editor-form');
    
    // Common Fields
    form.id.value = item.id;
    form.title.value = item.title || '';
    form.tags.value = (item.tags || []).join(', ');
    form.thumbnail.value = item.thumbnail || '';
    form.summary.value = item.summary || '';
    form.content.value = item.content || '';

    // Mode Specific
    if (currentMode === 'works') {
        form.status.value = item.status || 'planning';
        form.progress.value = item.progress || 0;
        form.lastUpdated.value = item.lastUpdated || new Date().toISOString().split('T')[0];
        
        // Tasks
        const taskContainer = document.getElementById('tasks-container');
        taskContainer.innerHTML = '';
        if (item.tasks && Array.isArray(item.tasks)) {
            item.tasks.forEach(task => addTaskField(task));
        }

        // Links
        const linkContainer = document.getElementById('links-container');
        linkContainer.innerHTML = '';
        if (item.links && Array.isArray(item.links)) {
            item.links.forEach(link => addLinkField(link));
        }
    } else {
        // Blog
        form.date.value = item.date || new Date().toISOString().split('T')[0];
    }
}

function createNewItem() {
    const list = getList();
    // Generate new ID (simple max + 1)
    // If IDs are strings (like UUIDs), this needs changing. Assuming numbers for now based on previous code.
    // Actually, let's check if IDs are numbers or strings.
    // Previous code used numbers.
    
    let newId = 1;
    if (list.length > 0) {
        const maxId = Math.max(...list.map(i => parseInt(i.id) || 0));
        newId = maxId + 1;
    }

    let newItem = {};
    if (currentMode === 'works') {
        newItem = {
            id: newId,
            title: "New Project",
            status: "planning",
            progress: 0,
            lastUpdated: new Date().toISOString().split('T')[0],
            tags: [],
            thumbnail: "",
            summary: "",
            content: "",
            tasks: [],
            links: []
        };
        appData.works.push(newItem);
    } else {
        newItem = {
            id: newId,
            title: "New Blog Post",
            date: new Date().toISOString().split('T')[0],
            tags: [],
            thumbnail: "",
            summary: "",
            content: ""
        };
        appData.blog.push(newItem);
    }

    selectItem(newId);
    updateJsonPreview();
}

function saveToMemory() {
    if (!currentId) return;
    const list = getList();
    const index = list.findIndex(i => i.id == currentId); // Loose equality for string/number mismatch
    if (index === -1) return;

    const form = document.getElementById('editor-form');
    
    // Base object
    const updatedItem = {
        id: parseInt(form.id.value), // Ensure ID is number
        title: form.title.value,
        tags: form.tags.value.split(',').map(t => t.trim()).filter(t => t),
        thumbnail: form.thumbnail.value,
        summary: form.summary.value,
        content: form.content.value
    };

    if (currentMode === 'works') {
        updatedItem.status = form.status.value;
        updatedItem.progress = parseInt(form.progress.value);
        updatedItem.lastUpdated = form.lastUpdated.value;

        // Collect Tasks
        const taskItems = document.querySelectorAll('.task-item-editor');
        const tasks = [];
        taskItems.forEach(item => {
            const name = item.querySelector('.task-name').value;
            const completed = item.querySelector('.task-completed').checked;
            if (name) tasks.push({ name, completed });
        });
        updatedItem.tasks = tasks;

        // Collect Links
        const linkItems = document.querySelectorAll('.link-item');
        const links = [];
        linkItems.forEach(item => {
            const label = item.querySelector('.link-label').value;
            const url = item.querySelector('.link-url').value;
            const type = item.querySelector('.link-type').value;
            if (label || url) links.push({ label, url, type });
        });
        updatedItem.links = links;

        appData.works[index] = updatedItem;
    } else {
        updatedItem.date = form.date.value;
        appData.blog[index] = updatedItem;
    }

    renderList();
    updateJsonPreview();
}

function deleteItem() {
    if (!currentId || !confirm('Are you sure you want to delete this item?')) return;
    
    if (currentMode === 'works') {
        appData.works = appData.works.filter(i => i.id != currentId);
    } else {
        appData.blog = appData.blog.filter(i => i.id != currentId);
    }

    const list = getList();
    if (list.length > 0) {
        selectItem(list[0].id);
    } else {
        createNewItem();
    }
    updateJsonPreview();
}

async function saveToServer() {
    saveToMemory(); // Ensure current form state is saved to memory first

    const payload = {
        type: currentMode,
        data: currentMode === 'works' ? { projects: appData.works } : { posts: appData.blog }
    };

    try {
        const response = await fetch('/api/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                alert(`Saved ${currentMode} data successfully!`);
            } else {
                alert('Server reported error: ' + result.message);
            }
        } else {
            alert('Network error saving data.');
        }
    } catch (e) {
        console.error(e);
        alert('Error saving to server.');
    }
}

function updateJsonPreview() {
    const data = currentMode === 'works' ? { projects: appData.works } : { posts: appData.blog };
    document.getElementById('json-output').value = JSON.stringify(data, null, 2);
}

function copyJson() {
    const textarea = document.getElementById('json-output');
    textarea.select();
    document.execCommand('copy');
    alert('JSON copied to clipboard!');
}

// --- Helpers ---

function addLinkField(data = { label: '', url: '', type: 'link' }) {
    const container = document.getElementById('links-container');
    const div = document.createElement('div');
    div.className = 'link-item';
    div.innerHTML = `
        <input type="text" class="form-control link-label" placeholder="Label" value="${data.label || ''}" style="flex: 1">
        <input type="text" class="form-control link-url" placeholder="URL" value="${data.url || ''}" style="flex: 2">
        <select class="form-control link-type" style="width: 80px">
            <option value="link" ${data.type !== 'image' ? 'selected' : ''}>Link</option>
            <option value="image" ${data.type === 'image' ? 'selected' : ''}>Image</option>
        </select>
        <button type="button" class="btn btn-icon" onclick="this.parentElement.remove()">×</button>
    `;
    container.appendChild(div);
}

function addTaskField(data = { name: '', completed: false }) {
    const container = document.getElementById('tasks-container');
    const div = document.createElement('div');
    div.className = 'link-item task-item-editor';
    div.innerHTML = `
        <input type="checkbox" class="task-completed" ${data.completed ? 'checked' : ''} style="margin-right: 8px;">
        <input type="text" class="form-control task-name" placeholder="Task Name" value="${data.name || ''}" style="flex: 1">
        <button type="button" class="btn btn-icon" onclick="this.parentElement.remove()">×</button>
    `;
    container.appendChild(div);
}
