# プロンプト生成・変換サービス

YAMLファイルからAI画像生成プロンプトを生成・変換するWebサービスです。

## デプロイ情報

本サービスはRailwayでホストされています。以下のURLでアクセス可能です：

```
https://image-video-prompts-production.up.railway.app
```

## 機能

- YAMLファイルのアップロードとパース
- プロンプトの生成と最適化
- 複数バリエーションの生成
- コピー機能付きのプロンプト表示
- エラーハンドリング
- レスポンシブなデザイン

## 技術スタック

### フロントエンド
- React
- js-yaml
- CSS Grid/Flexbox

### バックエンド
- Flask
- PyYAML
- Flask-CORS

## デプロイ
- Railway (自動デプロイ)
- GitHub連携

## 開発情報

### 環境構築
1. リポジトリのクローン
```bash
git clone https://github.com/etecoo/Image-Video-Prompts.git
```

2. 依存関係のインストール
```bash
# バックエンド
cd backend
pip install -r requirements.txt

# フロントエンド
cd frontend
npm install
```

### デプロイ
- mainブランチへのプッシュで自動的にRailwayにデプロイされます
- デプロイの状態はRailwayのダッシュボードで確認できます

## ライセンス
MIT