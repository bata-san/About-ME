# About-ME Portfolio - 実装仕様書

## 概要
「Matte Entity」デザインシステムに基づいたポートフォリオサイト。無機質で工業的な美学を採用し、グリッドベースのレイアウトとミニマルなインタラクションを特徴とする。

## デザインシステム: Matte Entity

### 色彩設計
- **プライマリ背景**: `#fcfcfc` (Light) / `#0a0a0a` (Dark)
- **セカンダリ背景**: `#f2f2f2` (Light) / `#1a1a1a` (Dark)
- **テキストプライマリ**: `#111827` (Light) / `#fcfcfc` (Dark)
- **テキストセカンダリ**: `#555555` (Light) / `#a0a0a0` (Dark)
- **シグナルレッド**: `#ff3131` - コンテキストインジケーター
- **CTAイエロー**: `#ffc700` - 控えめなアクション誘導

### タイポグラフィ
- **ディスプレイフォント**: Space Grotesk (見出し、タイトル)
- **ボディフォント**: Inter (本文)
- **メタフォント**: Silkscreen (メタ情報、ラベル)

### グリッドシステム
- **基本単位**: 40px
- **ドットグリッド**: 2px dot, 40px間隔
- **背景**: `radial-gradient` による視覚的グリッド

### インタラクション原則
- **シャドウなし**: マットな質感を維持
- **角丸最小**: 2px または 0px
- **トランジション**: `cubic-bezier(0.4, 0, 0.2, 1)`, 200ms
- **ホバー効果**: border変化のみ、transform禁止

---

## 主要機能実装状況

### 1. ホームページレイアウト (`index.html`)

#### 構造
```
.layout.container
  └── .home-grid (横並びレイアウト)
      ├── .card (プロフィールカード)
      └── .music-card (音楽ステータス)
```

#### プロフィールカード
- **アバター**: 80x80px, 正方形 (border-radius: 0)
- **名前**: Space Grotesk 40px, グリッチエフェクト on hover
- **情報セクション**: ドット区切り線によるリスト表示
- **ステータス**: Discord API連携（`js/discord.js`）
- **年齢表示**: クリックで単位切替（年/月/日/時/分/秒）

#### 音楽カード (SIGNAL)
- **ヘッダー**: 「SIGNAL」ラベル + 赤色インジケーター
- **現在再生中トラック**:
  - アルバムアート: 80x80px
  - ステータスドット（再生中は赤色で発光）
  - トラック名: Space Grotesk 16px bold
  - アーティスト名: Inter 13px, 右揃え
  - ミニイコライザー: 再生中のみ表示、3本バー
- **履歴リスト (RECENT LOGS)**:
  - 最大4件
  - タイムスタンプ: 右揃え（例: "3h", "11h", "15h"）
  - トラック名 - アーティスト名（左右配置）

#### レスポンシブ
- **800px以下**: `.home-grid` が縦積みに変更
- **600px以下**: プロフィールカードのpadding削減

---

### 2. Last.fm 統合 (`js/lastfm.js`)

#### API設定
```javascript
const LASTFM_API_KEY = '4000c22e2a41c9a91eca6f9f5874da75';
const LASTFM_USERNAME = 'Butter_sandwich';
const REFRESH_INTERVAL = 15000; // 15秒
```

#### 機能
- **リアルタイム更新**: 15秒間隔で自動ポーリング
- **タブ最適化**: `visibilitychange` イベントでバックグラウンド時は停止
- **取得件数**: 5件（最新1件 + 履歴4件）
- **画像取得**: extralarge > large > medium > small の優先順位

#### エラーハンドリング
- **CONFIG REQUIRED**: APIキー未設定時
- **NO SIGNAL**: トラックが見つからない場合
- **SIGNAL LOST**: ネットワークエラー（既存表示は保持）

#### 時刻フォーマット
- `< 60秒`: "NOW"
- `< 1時間`: "Xm" (例: "10m")
- `< 24時間`: "Xh" (例: "3h")
- `>= 24時間`: "M/D" (例: "1/5")

#### フォールバック画像 (`.no-art`)
- 背景: セカンダリ背景色
- パターン: 45度斜線ストライプ（警告表示風）
- テキスト: "NO DATA" (45度回転、Silkscreen 8px)

---

### 3. Works ページ (`works.html`, `js/works.js`)

#### レイアウト
- **グリッド表示**: カード形式
- **ツールバー**: フィルター（All/3D/Design/Web）+ ソート（Latest/Oldest/Name）
- **アコーディオン**: クリックで詳細展開

#### データ構造 (`data/works-data.json`)
```json
{
  "id": "unique-id",
  "title": "プロジェクト名",
  "category": "3D/Design/Web",
  "status": "completed/in-progress",
  "date": "YYYY-MM",
  "description": "説明文",
  "tools": ["Tool1", "Tool2"],
  "links": [{"url": "...", "label": "..."}],
  "thumbnail": "path/to/image.jpg"
}
```

#### スタイリング
- **カードホバー**: 赤線がtopから伸びる（幅40px）
- **ステータスバッジ**: 大文字、1px border
- **アコーディオンアイコン**: "+" → "×" (45度回転)

---

### 4. カスタムカーソル (`css/style.css`, `js/main.js`)

#### 構造
- **ドット**: 8x8px, プライマリテキスト色
- **アウトライン**: 40x40px, 1px border
- **ホバー時**: アウトライン拡大（60x60px）、半透明背景

#### 無効化条件
- モバイルデバイス: `@media (hover: none) and (pointer: coarse)`

---

### 5. テーマ切替 (`js/main.js`)

#### 実装
- **切替ボタン**: 右上固定配置
- **保存**: `localStorage` に `theme` キー
- **初期化**: システム設定 (`prefers-color-scheme`) を尊重
- **属性**: `data-theme="light"` / `data-theme="dark"` を `<html>` に付与

---

## ファイル構成

```
About-ME/
├── index.html                 # ホームページ
├── works.html                 # 作品一覧
├── blog.html                  # ブログ（未実装）
├── css/
│   ├── style.css             # メインスタイル（Matte Entity）
│   ├── works.css             # Works専用スタイル
│   └── editor.css            # エディター用（別機能）
├── js/
│   ├── main.js               # エントリーポイント
│   ├── lastfm.js             # Last.fm統合
│   ├── discord.js            # Discord Status
│   ├── works.js              # Works機能
│   ├── script.js             # 年齢計算、テーマ切替
│   └── utils.js              # ユーティリティ
├── data/
│   └── works-data.json       # 作品データ
└── img/                       # 画像アセット
```

---

## 未実装 / 改善候補

### 優先度: 高
1. **ブログ機能の実装**: 現在は `blog.html` が存在するが内容は未実装
2. **Works詳細ページ**: 個別プロジェクトの詳細表示
3. **画像最適化**: アルバムアート、thumbnailの遅延読み込み

### 優先度: 中
1. **アニメーション改善**: カード出現時のエントリーアニメーション調整
2. **Discord Status更新頻度**: 現在は初期ロード時のみ
3. **HUDレイヤー**: 情報表示（現在はモバイルで非表示）

### 優先度: 低
1. **アクセシビリティ**: ARIA属性の追加
2. **SEO最適化**: メタタグ、構造化データ
3. **パフォーマンス**: Critical CSS、Code Splitting

---

## 開発ガイドライン

### 新機能追加時の注意点
1. **絵文字禁止**: テキストベースまたはSVGアイコンを使用
2. **シャドウ禁止**: `box-shadow: none` を維持
3. **角丸制限**: `border-radius: 2px` または `0`
4. **色使用制限**: CSS変数のみ使用（`var(--variable-name)`）
5. **フォント指定**: Display/Body/Metaの3種類を使い分け

### コードスタイル
- **JavaScript**: ES6+ Modules
- **CSS**: BEM風命名、コメントによるセクション分割
- **HTML**: セマンティックなタグ使用

### デバッグ
- **Last.fm**: コンソールログでAPI応答確認
- **Discord**: ステータスが更新されない場合はAPIエンドポイント確認
- **レイアウト崩れ**: グリッド単位（40px）の倍数で調整

---

## API依存関係

### Last.fm API
- **エンドポイント**: `https://ws.audioscrobbler.com/2.0/`
- **メソッド**: `user.getrecenttracks`
- **制限**: 公式制限に準拠（通常は問題なし）
- **認証**: API Key のみ（OAuth不要）

### Discord API
- **実装**: `js/discord.js` で管理
- **注意**: Lanyard等のプロキシ使用を推奨

---

## セットアップ手順

1. **リポジトリクローン**
   ```bash
   git clone https://github.com/bata-san/About-ME.git
   cd About-ME
   ```

2. **Last.fm設定**
   - `js/lastfm.js` を開く
   - `LASTFM_API_KEY` と `LASTFM_USERNAME` を設定

3. **ローカルサーバー起動**
   ```bash
   # 例: Python
   python -m http.server 8000
   
   # 例: Node.js
   npx http-server
   ```

4. **ブラウザで確認**
   - `http://localhost:8000` にアクセス

---

## トラブルシューティング

### Last.fm が表示されない
- APIキーとユーザー名が正しいか確認
- ブラウザのコンソールでエラーメッセージ確認
- CORS問題: ローカルサーバーを使用すること

### レイアウトが崩れる
- CSS変数が正しく読み込まれているか確認
- `data-theme` 属性が `<html>` に付与されているか確認
- ブラウザキャッシュをクリア

### 画像が表示されない
- パスが正しいか確認（相対パス）
- 画像ファイルが存在するか確認
- Last.fm画像URLが有効か確認（APIレスポンス確認）

---

## 変更履歴（直近）

### 2026-01-05
- ✅ ホームページレイアウトをグリッド化（カード横並び）
- ✅ Last.fm統合（現在再生中 + 履歴表示）
- ✅ リアルタイム更新機能（15秒間隔）
- ✅ イコライザーをカバーアートから分離
- ✅ 時刻表示を簡潔に修正（"10m", "3h"形式）
- ✅ アーティスト名を右揃えに統一
- ✅ 画像取得ロジック改善（高画質優先）
- ✅ フォールバック画像のデザイン刷新

### 以前の実装
- Works ページのリファクタリング
- ソート・フィルター機能
- カスタムカーソル
- テーマ切替（Light/Dark）
- Discord Status統合

---

## 次のステップ（推奨）

1. **画像最適化**: アルバムアートのキャッシュ戦略
2. **エラー回復**: ネットワークエラー後の自動リトライ
3. **アニメーション**: 曲切替時のトランジション
4. **統計情報**: 総再生時間、トップアーティストなどの表示
5. **Blog実装**: Markdown → HTMLレンダリング

---

## 連絡先・参考リンク

- **GitHub**: https://github.com/bata-san/About-ME
- **Last.fm API Docs**: https://www.last.fm/api
- **デザインシステム**: Matte Entity（カスタム）
