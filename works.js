// ツールアイコンのマッピング
const toolIcons = {
    blender: { name: 'Blender', abbr: 'BL' },
    maya: { name: 'Maya', abbr: 'MA' },
    cinema4d: { name: 'Cinema 4D', abbr: 'C4D' },
    unity: { name: 'Unity', abbr: 'UN' },
    unreal: { name: 'Unreal', abbr: 'UE' },
    photoshop: { name: 'Photoshop', abbr: 'PS' },
    illustrator: { name: 'Illustrator', abbr: 'AI' },
    aftereffects: { name: 'After Effects', abbr: 'AE' },
    premiere: { name: 'Premiere', abbr: 'PR' },
    figma: { name: 'Figma', abbr: 'FG' },
    substance: { name: 'Substance', abbr: 'SB' },
    zbrush: { name: 'ZBrush', abbr: 'ZB' },
    octane: { name: 'Octane', abbr: 'OC' },
    vray: { name: 'V-Ray', abbr: 'VR' }
};

// SNSアイコンのSVG
const socialIcons = {
    twitter: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
    </svg>`,
    instagram: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>`,
    artstation: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M2 21L12 3l10 18H2z"></path>
    </svg>`,
    behance: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="2" y="4" width="20" height="16" rx="2"></rect>
        <path d="M8 12h4"></path>
        <path d="M8 8h3"></path>
        <path d="M8 16h3"></path>
    </svg>`,
    dribbble: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.5m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32"></path>
    </svg>`,
    youtube: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
    </svg>`
};

let currentSlide = 0;
let worksData = [];

// JSONデータの読み込み
async function loadWorksData() {
    try {
        const response = await fetch('works-data.json');
        worksData = (await response.json()).works;
        initializeSlider();
    } catch (error) {
        console.error('Failed to load works data:', error);
        // フォールバック: デフォルトデータを使用
        worksData = getDefaultData();
        initializeSlider();
    }
}

// デフォルトデータ（JSONが読み込めない場合のフォールバック）
function getDefaultData() {
    return [
        {
            id: 1,
            title: "Sample Project",
            description: "Please edit works-data.json to add your projects.",
            media: { type: "image", url: "" },
            tools: ["blender"],
            monthsAgo: 1,
            links: { twitter: "https://twitter.com/" }
        }
    ];
}

// 月数を表示用テキストに変換
function getTimeAgoText(monthsAgo) {
    if (monthsAgo === 0) return 'This month';
    if (monthsAgo === 1) return '1 month ago';
    if (monthsAgo < 12) return `${monthsAgo} months ago`;
    const years = Math.floor(monthsAgo / 12);
    return years === 1 ? '1 year ago' : `${years} years ago`;
}

// スライドのHTML生成
function createSlide(work) {
    const slide = document.createElement('div');
    slide.className = 'slide';
    
    // メディア部分
    let mediaContent = '';
    if (work.media.url && work.media.type === 'video') {
        mediaContent = `<video controls><source src="${work.media.url}" type="video/mp4"></video>`;
    } else if (work.media.url && work.media.type === 'image') {
        mediaContent = `<img src="${work.media.url}" alt="${work.title}">`;
    } else {
        mediaContent = `<div class="placeholder">Add your image/video in works-data.json</div>`;
    }
    
    // ツールアイコン生成
    const toolIconsHtml = work.tools.map(tool => {
        const toolInfo = toolIcons[tool] || { name: tool, abbr: tool.substring(0, 2).toUpperCase() };
        return `<div class="tool-icon" data-tooltip="${toolInfo.name}">${toolInfo.abbr}</div>`;
    }).join('');
    
    // SNSリンク生成
    const socialLinksHtml = Object.entries(work.links || {}).map(([platform, url]) => {
        const icon = socialIcons[platform] || socialIcons.twitter;
        const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
        return `<a href="${url}" target="_blank" class="social-link">${icon}${platformName}</a>`;
    }).join('');
    
    slide.innerHTML = `
        <div class="slide-media">
            ${mediaContent}
        </div>
        <div class="slide-content">
            <div class="slide-header">
                <h3 class="slide-title">${work.title}</h3>
                <div class="slide-date">${getTimeAgoText(work.monthsAgo)}</div>
            </div>
            <p class="slide-description">${work.description}</p>
            <div class="slide-tools">
                <span class="tools-label">Tools</span>
                <div class="tool-icons">
                    ${toolIconsHtml}
                </div>
            </div>
            ${socialLinksHtml ? `<div class="slide-links">${socialLinksHtml}</div>` : ''}
        </div>
    `;
    
    return slide;
}

// スライダーの初期化
function initializeSlider() {
    const slider = document.getElementById('slider');
    const indicators = document.getElementById('indicators');
    const slideCounter = document.getElementById('slideCounter');
    
    // スライド生成
    slider.innerHTML = '';
    worksData.forEach((work, index) => {
        const slide = createSlide(work);
        if (index === 0) slide.classList.add('active');
        slider.appendChild(slide);
    });
    
    // インジケーター生成
    indicators.innerHTML = '';
    worksData.forEach((_, index) => {
        const indicator = document.createElement('span');
        indicator.className = 'indicator';
        if (index === 0) indicator.classList.add('active');
        indicator.addEventListener('click', () => {
            currentSlide = index;
            updateSlider();
        });
        indicators.appendChild(indicator);
    });
    
    // カウンター更新
    slideCounter.textContent = `1 / ${worksData.length}`;
    
    // ナビゲーション設定
    setupNavigation();
}

// ナビゲーション設定
function setupNavigation() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const slides = document.querySelectorAll('.slide');
    const totalSlides = slides.length;
    
    // 前へボタン
    prevBtn.addEventListener('click', () => {
        if (currentSlide > 0) {
            currentSlide--;
            updateSlider();
        }
    });
    
    // 次へボタン
    nextBtn.addEventListener('click', () => {
        if (currentSlide < totalSlides - 1) {
            currentSlide++;
            updateSlider();
        }
    });
    
    // キーボード操作
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' && currentSlide > 0) {
            currentSlide--;
            updateSlider();
        } else if (e.key === 'ArrowRight' && currentSlide < totalSlides - 1) {
            currentSlide++;
            updateSlider();
        }
    });
    
    // スワイプ対応
    const slider = document.getElementById('slider');
    let touchStartX = 0;
    let touchEndX = 0;
    
    slider.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    slider.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe(totalSlides);
    });
    
    function handleSwipe(totalSlides) {
        const swipeThreshold = 50;
        if (touchEndX < touchStartX - swipeThreshold && currentSlide < totalSlides - 1) {
            currentSlide++;
            updateSlider();
        }
        if (touchEndX > touchStartX + swipeThreshold && currentSlide > 0) {
            currentSlide--;
            updateSlider();
        }
    }
    
    // 初期状態更新
    updateSlider();
}

// スライダー更新
function updateSlider() {
    const slider = document.getElementById('slider');
    const slides = document.querySelectorAll('.slide');
    const indicators = document.querySelectorAll('.indicator');
    const slideCounter = document.getElementById('slideCounter');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const totalSlides = slides.length;
    
    // スライド移動
    slider.style.transform = `translateX(-${currentSlide * 100}%)`;
    
    // カウンター更新
    slideCounter.textContent = `${currentSlide + 1} / ${totalSlides}`;
    
    // インジケーター更新
    indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === currentSlide);
    });
    
    // スライドのアクティブ状態更新
    slides.forEach((slide, index) => {
        slide.classList.toggle('active', index === currentSlide);
    });
    
    // ボタンの無効化
    prevBtn.disabled = currentSlide === 0;
    nextBtn.disabled = currentSlide === totalSlides - 1;
}

// ページ読み込み時に実行
document.addEventListener('DOMContentLoaded', loadWorksData);
