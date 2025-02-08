# プロジェクト構造と重要な設定

## バックエンド

### プロンプト処理モジュール
#### backend/prompt_utils.py
YAMLからのプロンプト抽出と最適化を行う主要モジュール。

**主要機能:**
1. プロンプト抽出
   - 複数のYAML形式に対応（illusion-art, midjourney-prompts, images）
   - プロンプト詳細からの優先抽出
   - structure.yamlセクションの適切なスキップ

2. プロンプト最適化
   - サービスごとの最適化（midjourney, imagefx, dalle等）
   - 日本語から英語への自動翻訳
   - パラメータの自動追加

3. エラーハンドリング
   - 詳細なエラーログ
   - デバッグ情報の出力
   - 適切なフォールバック処理

**使用例:**
```python
from prompt_utils import optimize_prompt

# YAMLデータからプロンプトを抽出・最適化
result = optimize_prompt(yaml_content, service='midjourney')

# 結果の利用
for prompt in result:
    print(prompt)  # 最適化されたプロンプト
```

**対応するYAML形式:**
1. プロンプト詳細形式
```yaml
content: |
  説明文
  プロンプト詳細: "English prompt"
```

2. プロンプトセクション形式
```yaml
content: |
  説明文
  プロンプト:
  - プロンプト1
  - プロンプト2
```

3. 直接プロンプト形式
```yaml
content: "Direct prompt text"
```

### テストモジュール
#### backend/test_prompt_utils.py
プロンプト処理機能のテストを行うモジュール。

**機能:**
- 複数のYAMLファイルのテスト
- プロンプト抽出の検証
- エラーケースの確認

[以下既存の内容]