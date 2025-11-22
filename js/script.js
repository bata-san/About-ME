// カードのエントリーアニメーション
document.addEventListener('DOMContentLoaded', () => {
    const card = document.querySelector('.card');
    const container = document.querySelector('.container');
    const worksTrigger = document.getElementById('works-trigger');
    const worksPanel = document.getElementById('works-panel');
    const closeWorks = document.getElementById('close-works');
    const overlay = document.getElementById('overlay');
    const worksList = document.getElementById('works-list');

    // カードの初期状態
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';

    // アニメーション開始
    setTimeout(() => {
        card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
    }, 100);

    // Worksパネルの制御
    worksTrigger.addEventListener('click', async (e) => {
        e.preventDefault();

        // データ読み込み（初回のみ）
        if (!worksList.hasChildNodes() || worksList.children.length === 0) {
            await loadWorksData();
        }

        worksPanel.classList.add('active');
        overlay.classList.add('active');
        container.classList.add('shifted');
    });

    function closePanel() {
        worksPanel.classList.remove('active');
        overlay.classList.remove('active');
        container.classList.remove('shifted');
    }

    closeWorks.addEventListener('click', closePanel);
    overlay.addEventListener('click', closePanel);

    // ESCキーで閉じる
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && worksPanel.classList.contains('active')) {
            closePanel();
        }
    });

    // Worksデータの読み込みと表示
    async function loadWorksData() {
        try {
            const response = await fetch('data/works-data.json');
            const data = await response.json();

            worksList.innerHTML = data.works.map((work, index) => `
                <div class="work-item" style="animation-delay: ${index * 0.1}s">
                    <div class="work-header">
                        <h3 class="work-title">${work.title}</h3>
                        <div class="work-meta">
                            <div class="meta-item">
                                <span class="meta-label">Tools:</span>
                                <span>${work.tools.join(', ')}</span>
                            </div>
                            <div class="meta-item">
                                <span class="meta-label">Progress:</span>
                                <span>${work.progress || 'Ongoing'}</span>
                            </div>
                        </div>
                    </div>
                    
                    ${work.media ? `
                        <img src="${work.media.url}" alt="${work.title}" class="work-image" loading="lazy">
                    ` : ''}
                    
                    <div class="work-content">
                        <p>${work.description}</p>
                        ${work.content ? `<p>${work.content}</p>` : ''}
                    </div>
                    
                    ${work.links ? `
                        <div class="card-footer" style="margin-top: 24px;">
                            ${Object.entries(work.links).map(([key, url]) => `
                                <a href="${url}" target="_blank" class="link-button">
                                    View on ${key.charAt(0).toUpperCase() + key.slice(1)}
                                </a>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            `).join('');

        } catch (error) {
            console.error('Error loading works:', error);
            worksList.innerHTML = '<p>Failed to load works data.</p>';
        }
    }

    // リンクボタンのインタラクション
    const linkButtons = document.querySelectorAll('.link-button');
    linkButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            // Worksトリガーは除外
            if (button.id === 'works-trigger') return;

            // 外部リンクの場合はそのまま遷移
            const href = button.getAttribute('href');
            if (href && (href.startsWith('http') || href.endsWith('.html'))) {
                return;
            }

            e.preventDefault();

            // リップル効果
            createRipple(e, button);
        });
    });

    function createRipple(e, button) {
        const ripple = document.createElement('span');
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(255, 255, 255, 0.5)';
        ripple.style.width = '20px';
        ripple.style.height = '20px';
        ripple.style.pointerEvents = 'none';
        ripple.style.animation = 'ripple 0.6s ease-out';

        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ripple.style.left = `${x - 10}px`;
        ripple.style.top = `${y - 10}px`;

        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    }
});

// リップルアニメーション用のキーフレームをCSSに追加
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);