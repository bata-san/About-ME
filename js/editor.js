let projects = [];
let currentProjectId = null;

document.addEventListener('DOMContentLoaded', () => {
    // Initial Load
    loadData();

    // Event Listeners
    document.getElementById('add-btn').addEventListener('click', createNewProject);
    document.getElementById('delete-btn').addEventListener('click', deleteProject);
    document.getElementById('save-btn').addEventListener('click', saveCurrentProject);
    document.getElementById('save-file-btn').addEventListener('click', saveToFile);
    document.getElementById('load-btn').addEventListener('click', loadData);
    document.getElementById('copy-json-btn').addEventListener('click', copyJson);
    document.getElementById('add-link-btn').addEventListener('click', () => addLinkField());
    document.getElementById('add-task-btn').addEventListener('click', () => addTaskField());
});

async function loadData() {
    try {
        const response = await fetch('data/works-data.json');
        if (response.ok) {
            const data = await response.json();
            projects = data.projects || [];
            renderProjectList();
            updateJsonOutput();
            if (projects.length > 0) {
                selectProject(projects[0].id);
            }
        } else {
            alert('Could not load data/works-data.json automatically. Starting with empty list.');
        }
    } catch (e) {
        console.error(e);
        alert('Error loading data. Ensure you are running this on a local server.');
    }
}

function renderProjectList() {
    const list = document.getElementById('project-list');
    list.innerHTML = '';

    projects.forEach(p => {
        const div = document.createElement('div');
        div.className = `project-item ${p.id === currentProjectId ? 'active' : ''}`;
        div.onclick = () => selectProject(p.id);
        div.innerHTML = `
            <div class="project-item-title">${p.title || 'Untitled'}</div>
            <div class="project-item-meta">
                <span>${p.status}</span>
                <span>${p.lastUpdated}</span>
            </div>
        `;
        list.appendChild(div);
    });
}

function selectProject(id) {
    currentProjectId = id;
    const project = projects.find(p => p.id === id);
    if (!project) return;

    renderProjectList(); // Update active state

    // Populate Form
    const form = document.getElementById('project-form');
    form.id.value = project.id;
    form.title.value = project.title || '';
    form.status.value = project.status || 'planning';
    form.progress.value = project.progress || 0;
    form.lastUpdated.value = project.lastUpdated || new Date().toISOString().split('T')[0];
    form.tags.value = (project.tags || []).join(', ');
    form.thumbnail.value = project.thumbnail || '';
    form.summary.value = project.summary || '';
    form.content.value = project.content || '';

    // Populate Tasks
    const taskContainer = document.getElementById('tasks-container');
    taskContainer.innerHTML = '';
    if (project.tasks && Array.isArray(project.tasks)) {
        project.tasks.forEach(task => addTaskField(task));
    }

    // Populate Links
    const container = document.getElementById('links-container');
    container.innerHTML = '';
    if (project.links && Array.isArray(project.links)) {
        project.links.forEach(link => addLinkField(link));
    }
}

function createNewProject() {
    const newId = projects.length > 0 ? Math.max(...projects.map(p => p.id)) + 1 : 1;
    const newProject = {
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
    projects.push(newProject);
    renderProjectList();
    selectProject(newId);
    updateJsonOutput();
}

function saveCurrentProject() {
    if (!currentProjectId) return;

    const form = document.getElementById('project-form');
    const index = projects.findIndex(p => p.id === currentProjectId);
    
    if (index !== -1) {
        // Collect Tasks
        const taskItems = document.querySelectorAll('.task-item-editor');
        const tasks = [];
        taskItems.forEach(item => {
            const name = item.querySelector('.task-name').value;
            const completed = item.querySelector('.task-completed').checked;
            if (name) {
                tasks.push({ name, completed });
            }
        });

        // Collect Links
        const linksContainer = document.getElementById('links-container');
        const linkItems = linksContainer.querySelectorAll('.link-item');
        const links = [];
        linkItems.forEach(item => {
            const labelInput = item.querySelector('.link-label');
            const urlInput = item.querySelector('.link-url');
            const typeInput = item.querySelector('.link-type');
            
            if (labelInput && urlInput && typeInput) {
                const label = labelInput.value;
                const url = urlInput.value;
                const type = typeInput.value;
                if (label || url) {
                    links.push({ label, url, type });
                }
            }
        });

        projects[index] = {
            id: parseInt(form.id.value),
            title: form.title.value,
            status: form.status.value,
            progress: parseInt(form.progress.value),
            lastUpdated: form.lastUpdated.value,
            tags: form.tags.value.split(',').map(t => t.trim()).filter(t => t),
            thumbnail: form.thumbnail.value,
            summary: form.summary.value,
            content: form.content.value,
            tasks: tasks,
            links: links
        };

        renderProjectList();
        updateJsonOutput();
        alert('Saved to memory! Don\'t forget to copy JSON.');
    }
}

function deleteProject() {
    if (!currentProjectId || !confirm('Are you sure?')) return;
    projects = projects.filter(p => p.id !== currentProjectId);
    currentProjectId = null;
    renderProjectList();
    updateJsonOutput();
    if (projects.length > 0) selectProject(projects[0].id);
}

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
    div.className = 'link-item task-item-editor'; // Reuse link-item style for layout
    div.innerHTML = `
        <input type="checkbox" class="task-completed" ${data.completed ? 'checked' : ''} style="margin-right: 8px;">
        <input type="text" class="form-control task-name" placeholder="Task Name" value="${data.name || ''}" style="flex: 1">
        <button type="button" class="btn btn-icon" onclick="this.parentElement.remove()">×</button>
    `;
    container.appendChild(div);
}

function updateJsonOutput() {
    const json = JSON.stringify({ projects: projects }, null, 2);
    document.getElementById('json-output').value = json;
}

function copyJson() {
    const textarea = document.getElementById('json-output');
    textarea.select();
    document.execCommand('copy');
    alert('JSON copied to clipboard!');
}

async function saveToFile() {
    const json = JSON.stringify({ projects: projects }, null, 2);

    // 1. Try Server API (Node.js backend)
    try {
        const response = await fetch('/api/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: json
        });

        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                alert('Saved to server successfully!');
                return;
            }
        }
    } catch (e) {
        console.log('Server save failed, trying other methods...', e);
    }

    // 2. Try File System Access API (Chrome/Edge Desktop)
    try {
        if (window.showSaveFilePicker) {
            const options = {
                suggestedName: 'works-data.json',
                types: [{
                    description: 'JSON Files',
                    accept: {
                        'application/json': ['.json'],
                    },
                }],
            };
            
            const handle = await window.showSaveFilePicker(options);
            const writable = await handle.createWritable();
            await writable.write(json);
            await writable.close();
            alert('File saved successfully!');
            return;
        }
    } catch (err) {
        // Ignore AbortError (user cancelled)
        if (err.name === 'AbortError') return;
        console.warn('File System Access API failed, falling back to download:', err);
    }

    // 3. Fallback: Download as file
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'works-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('File downloaded! Please replace the original data/works-data.json with this file.');
}
