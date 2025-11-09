// カードのエントリーアニメーション
document.addEventListener('DOMContentLoaded', () => {
    const card = document.querySelector('.card');
    
    // カードの初期状態
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    
    // アニメーション開始
    setTimeout(() => {
        card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
    }, 100);
    
    // リンクボタンのインタラクション
    const linkButtons = document.querySelectorAll('.link-button');
    linkButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            // 外部リンクの場合はそのまま遷移
            const href = button.getAttribute('href');
            if (href && (href.startsWith('http') || href.endsWith('.html'))) {
                return;
            }
            
            e.preventDefault();
            
            // リップル効果
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
        });
    });
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