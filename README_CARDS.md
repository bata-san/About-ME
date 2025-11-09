# 名刺エコシステム - 使い方ガイド

このポートフォリオサイトは、複数の名刺を動的に追加・管理できる拡張可能なシステムになっています。

## 基本構造

### CardManager クラス
`script.js` に実装されたカード管理システム：

```javascript
const cardManager = new CardManager();
```

## 使い方

### 1. 既存の名刺を表示/非表示

```javascript
// 名刺を表示
cardManager.showCard('portfolio');

// 名刺を非表示（メインカードは非表示にできません）
cardManager.hideCard('portfolio');
```

### 2. 新しい名刺を追加する方法

#### 方法A: HTMLで追加してから登録

```javascript
// HTML要素を作成
const newCard = document.createElement('div');
newCard.innerHTML = `
    <div class="card-content">
        <h2>新しい名刺のタイトル</h2>
        <p>内容...</p>
    </div>
`;

// システムに登録
cardManager.addCard('my-new-card', newCard);

// 表示
cardManager.showCard('my-new-card');
```

#### 方法B: createCard メソッドを使用

```javascript
// 名刺を作成して登録
const card = cardManager.createCard('my-card', `
    <h2>名刺タイトル</h2>
    <div class="portfolio-section">
        <h3>🎯 セクション</h3>
        <p>内容...</p>
    </div>
`);

// 表示
cardManager.showCard('my-card');
```

### 3. 名刺の例：プロジェクト詳細カード

```javascript
const projectCard = cardManager.createCard('project-details', `
    <button class="close-btn" onclick="cardManager.hideCard('project-details')">×</button>
    
    <div class="portfolio-header">
        <h2>Project Details</h2>
    </div>

    <div class="portfolio-section">
        <h3>📱 アプリ名</h3>
        <p>プロジェクトの説明...</p>
    </div>

    <div class="portfolio-section">
        <h3>🛠️ 使用技術</h3>
        <div class="skills-grid">
            <span class="skill-tag">React</span>
            <span class="skill-tag">TypeScript</span>
        </div>
    </div>

    <div class="portfolio-section">
        <h3>🔗 リンク</h3>
        <a href="#" target="_blank">GitHub Repository</a>
    </div>
`);

// ボタンなどでトリガー
document.querySelector('#someButton').addEventListener('click', () => {
    cardManager.showCard('project-details');
});
```

### 4. 名刺の例：連絡先カード

```javascript
const contactCard = cardManager.createCard('contact', `
    <button class="close-btn" onclick="cardManager.hideCard('contact')">×</button>
    
    <div class="portfolio-header">
        <h2>Contact Information</h2>
    </div>

    <div class="portfolio-section">
        <h3>📧 Email</h3>
        <p>your.email@example.com</p>
    </div>

    <div class="portfolio-section">
        <h3>📱 Social Media</h3>
        <div class="sns-links">
            <!-- SNSリンク -->
        </div>
    </div>
`);
```

## 自動調整機能

- **幅の自動調整**: 表示される名刺の数に応じて、コンテナの幅が自動的に調整されます
  - 1枚: 450px
  - 2枚: 950px
  - 3枚: 1450px
  - 4枚: 1950px

- **レスポンシブ対応**: モバイルでは自動的に縦並びになります

## カスタマイズのヒント

### スタイリング
既存の `.portfolio-card` クラスのスタイルが新しい名刺にも適用されます。
カスタムスタイルを追加する場合は `style.css` に追加してください。

### アニメーション
名刺の表示/非表示は自動的にアニメーションします。
タイミングや効果を変更したい場合は、`.business-card.animating` のCSSを編集してください。

## 実装例：フルコード

```javascript
// スクリプトの最後に追加

// 「もっと見る」ボタンを作成
const showMoreBtn = document.createElement('button');
showMoreBtn.textContent = 'Show More Projects';
showMoreBtn.className = 'show-more-btn';
document.querySelector('.card-content').appendChild(showMoreBtn);

// プロジェクト詳細カードを作成
const projectDetailsCard = cardManager.createCard('projects-detail', `
    <button class="close-btn" onclick="cardManager.hideCard('projects-detail')">×</button>
    
    <div class="portfolio-header">
        <h2>All Projects</h2>
    </div>

    <div class="portfolio-section">
        <h3>🎮 Project 1</h3>
        <p>詳細な説明...</p>
    </div>

    <div class="portfolio-section">
        <h3>🌐 Project 2</h3>
        <p>詳細な説明...</p>
    </div>
`);

// ボタンクリックで表示
showMoreBtn.addEventListener('click', () => {
    cardManager.showCard('projects-detail');
});
```

## まとめ

このシステムにより、無限に名刺を追加できる拡張可能なポートフォリオサイトになりました。
新しいセクションや情報を追加したい場合は、簡単に新しい名刺を作成して表示できます！
