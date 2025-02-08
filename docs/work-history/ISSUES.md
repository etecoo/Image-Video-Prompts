# 問題と解決策の記録

## デプロイエラーの解決 [2025-02-08]

### 問題の詳細
```
ImportError: cannot import name 'load_yaml_content' from 'prompt_utils'
```

1. エラーの原因
   - app.pyが期待する関数がprompt_utils.pyで見つからない
   - クラス内のメソッドとして実装されていた関数が外部から参照できない

2. 影響範囲
   - Herokuデプロイの失敗
   - アプリケーションの起動エラー
   - APIエンドポイントの利用不可

### 解決策
1. prompt_utils.pyの構造を修正
```python
# モジュールレベルで関数を公開
def load_yaml_content(content):
    """YAMLコンテンツをPythonオブジェクトに変換"""
    try:
        return yaml.safe_load(content)
    except yaml.YAMLError as e:
        raise ValueError(f"YAML解析エラー: {str(e)}")

class PromptOptimizer:
    # クラス内部の実装
    ...

# 外部向けインターフェース
def optimize_prompt(yaml_data, service='default'):
    optimizer = PromptOptimizer()
    ...

def generate_variations(base_prompt, num_variations=1):
    optimizer = PromptOptimizer()
    ...
```

2. app.pyとの互換性確保
   - 必要な関数をモジュールレベルで公開
   - クラス内部の実装を維持しながら外部インターフェースを提供
   - エラーハンドリングの強化

### テスト結果
1. ローカル環境での動作確認
   - テストスクリプトによる機能確認
   - 異なるYAML形式での動作確認
   - エラーケースの検証

2. デプロイ環境での確認
   - Herokuデプロイの成功
   - APIエンドポイントの動作確認
   - エラーログの確認

### 再発防止策
1. モジュール設計の改善
   - 外部インターフェースの明確な定義
   - クラス内部と外部の責務の分離
   - 適切なエラーハンドリングの実装

2. テスト強化
   - デプロイ前のテスト項目追加
   - インポートテストの追加
   - エラーケースのカバレッジ向上

### 関連ファイル
- backend/prompt_utils.py
- backend/app.py
- docs/work-history/archives/ISSUES-2025-02-08.md（過去の問題と解決策のアーカイブ）