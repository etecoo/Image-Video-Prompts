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
│       └── index.css           # グローバルスタイル
├── backend/                     # Pythonバックエンド
│   ├── app.py                  # メインアプリケーション
│   ├── prompt_utils.py         # プロンプト処理ユーティリティ
│   └── requirements.txt        # Python依存関係
└── urashima/                   # プロンプトテンプレート
    ├── urashima-prompts.yaml   # Midjourneyおよびrunway_ml用プロンプト
    └── urashima-yaml-01        # その他のプロンプト定義

### 重要なファイル
- frontend/package.json: フロントエンドの依存関係とスクリプト定義
- backend/app.py: FlaskベースのRESTful API実装
- backend/prompt_utils.py: プロンプト変換ロジック
- urashima/urashima-prompts.yaml: 異なるAIモデル用のプロンプトテンプレート

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