# プロンプト生成・変換サービス プロジェクト概要

## プロジェクト構造

### ディレクトリ構造
```
.
├── docs/                          # プロジェクトのドキュメント
│   ├── project-context/          # プロジェクトのコンテキスト情報
│   │   └── 00-CORE.md           # プロジェクト構造と重要な設定
│   ├── technical-decisions/      # 技術的な決定記録
│   │   ├── ADR.md               # アーキテクチャ決定記録
│   │   └── DESIGN.md            # 設計文書
│   └── work-history/            # 作業履歴
│       ├── CHANGELOG.md         # 変更履歴
│       └── ISSUES.md            # 問題と解決策の記録
├── frontend/                     # Reactフロントエンド
│   ├── public/                  # 静的ファイル
│   │   └── index.html          # メインHTML
│   └── src/                     # ソースコード
│       ├── App.js              # メインアプリケーションコンポーネント
│       ├── App.css             # アプリケーションスタイル
│       ├── index.js            # エントリーポイント
│       ├── index.css           # グローバルスタイル
│       └── utils/              # ユーティリティ
│           └── yamlParser.js   # YAML処理ユーティリティ
├── backend/                     # Pythonバックエンド
│   ├── app.py                  # メインアプリケーション
│   ├── prompt_utils.py         # プロンプト処理ユーティリティ
│   └── requirements.txt        # Python依存関係
└── urashima/                   # プロンプトテンプレート
    ├── urashima-prompts.yaml   # Midjourneyおよびrunway_ml用プロンプト
    └── urashima-yaml-01        # 神威から生成されたプロンプトテンプレート

### 重要なファイル
- frontend/src/App.js: 
  - メインアプリケーションコンポーネント
  - AIサービスの分類表示（画像/動画）
  - 要素ベースのプロンプト生成フォーム
  - プロンプト生成数の制御UI
- frontend/src/App.css:
  - アプリケーションスタイル
  - レスポンシブデザイン
  - モダンなUI要素
- backend/app.py:
  - FlaskベースのRESTful API実装
  - 複数プロンプト処理
  - 要素ベース生成API
- backend/prompt_utils.py:
  - プロンプト変換・生成ロジック
  - 要素ベースの生成機能
  - AIサービス別の最適化
- urashima/urashima-prompts.yaml:
  - 各AIサービス用のプロンプトテンプレート
- urashima/urashima-yaml-01:
  - 変換モード用のYAMLテンプレート

## 機能概要

### プロンプト生成モード
1. 要素ベース生成
   - 9つの要素入力
     * Subject（主題：人物、ものなど）
     * Environment（環境）
     * When（時間帯・時期）
     * Action（動作・行動）
     * Mood（雰囲気）
     * Style（スタイル）
     * Details（ディテール）
     * Composition（構図：プリセットから選択）
     * Color Palette（カラーパレット）
   - 構図プリセット
     * Center Composition
     * Rule of Thirds
     * Golden Ratio
     * Diagonal
     * Symmetrical
     * Frame Within Frame
     * Leading Lines
     * Triangular
     * Radial
     * Pattern
   - 生成数制御（1-10個）
   - AIサービス別の最適化

### YAML変換モード
1. ファイル処理
   - 最大10個のプロンプト抽出
   - 各プロンプトの個別コピー機能
2. サービス最適化
   - 画像生成AI対応
   - 動画生成AI対応
   - Runway ML（画像/動画）対応

### 対応AIサービス

#### 画像生成AI
- Midjourney
- Image FX
- Imagen
- DALL-E 3
- Runway ML（画像モード）

#### 動画生成AI
- Runway ML（動画モード）
- Sora
- Pika Labs
- Stable Video
- Gen-2

## 依存関係

### フロントエンド
- React 18.2.0: UIフレームワーク
- react-dom 18.2.0: DOMレンダリング
- react-scripts 5.0.1: ビルドツール
- テスト関連:
  - @testing-library/jest-dom 5.16.5
  - @testing-library/react 13.4.0
  - @testing-library/user-event 13.5.0

### バックエンド
- Flask: 軽量Webフレームワーク
- PyYAML: YAMLパーサー/ジェネレーター
- googletrans: 翻訳機能
- requests: HTTP通信

## ドキュメント管理方針

### 1. 変更管理
- すべての重要な変更はCHANGELOG.mdに記録
- 変更はセマンティックバージョニングに従って管理
- 各変更には関連するコミットハッシュやPR番号を記録

### 2. 問題追跡
- 発生した問題はすべてISSUES.mdに記録
- 問題には以下を含める：
  - 問題の詳細な説明
  - 再現手順
  - 解決策
  - 関連するコミットやPR

### 3. 設計決定
- アーキテクチャの決定はADR.mdに記録
- 詳細な設計はDESIGN.mdに記録
- 各決定には理由と代替案の検討を含める

### 4. コードレビュー
- すべての変更はレビューを必要とする
- レビューコメントは適切に文書化
- 重要な議論は技術文書に反映