# ビルドステージ
FROM node:16 AS frontend-build
WORKDIR /app
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install
COPY frontend/ ./frontend/
RUN cd frontend && CI=false npm run build

# 実行ステージ
FROM python:3.9-slim
WORKDIR /app

# Pythonの依存関係をインストール
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# フロントエンドのビルド成果物をコピー
COPY --from=frontend-build /app/frontend/build ./frontend/build

# バックエンドのコードをコピー
COPY backend/ ./backend/

# 環境変数を設定
ENV FLASK_APP=backend/app.py
ENV FLASK_ENV=production

# ポートを公開
EXPOSE 8000

# アプリケーションを実行
CMD ["gunicorn", "--chdir", "backend", "--bind", "0.0.0.0:8000", "app:app"]