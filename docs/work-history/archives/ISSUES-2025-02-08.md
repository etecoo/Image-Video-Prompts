## デプロイエラーの解決

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

## YAML形式の多様性への対応

### 概要
YAMLファイルが異なる形式（midjourney-prompts形式とimages形式）で出力され、プロンプトの抽出に問題が発生していました。

### 問題の詳細
1. 異なるYAML形式への対応が不十分
   - midjourney-prompts形式
   - images形式（プロンプトセクションを含む）
2. プロンプト抽出ロジックが特定の形式にのみ対応
3. デバッグ情報が不足し、問題の特定が困難

### 原因
- YAML形式の違いを考慮していないプロンプト抽出ロジック
- セクション境界の判定が不適切
- エラーハンドリングの不足

### 解決策
1. プロンプト抽出ロジックの改善
```python
def extract_prompts(self, yaml_data: Union[Dict, List, str]) -> List[str]:
    prompts = []
    if 'midjourney-prompts' in src_data:
        # midjourney-prompts形式の処理
        for prompt_data in midjourney_prompts.values():
            if 'content' in prompt_data:
                prompts.append(prompt_data['content'])
    elif 'images' in src_data:
        # images形式の処理
        for image_data in images.values():
            if 'content' in image_data:
                # プロンプトセクションの抽出
                if 'プロンプト:' in content:
                    # 行ごとの処理
                    prompt_lines = []
                    in_prompt_section = False
                    for line in content.split('\n'):
                        if line.startswith('プロンプト:'):
                            in_prompt_section = True
                        elif line.startswith('詳細仕様:'):
                            break
                        elif in_prompt_section and line.startswith('-'):
                            prompt_lines.append(line[1:].strip())
                    if prompt_lines:
                        prompts.append(' '.join(prompt_lines))
    return prompts[:10]
```

2. デバッグ情報の強化
- データ構造の詳細表示
- セクションの存在確認
- 抽出プロセスのログ出力

### 関連ファイル
- `backend/prompt_utils.py`

### 備考
この修正により、異なるYAML形式のどちらでも正しくプロンプトが抽出されるようになりました。

## googletransライブラリの安定性問題

### 概要
googletransライブラリを使用した翻訳機能で500エラーが発生し、サービスの安定性に影響を与えています。

### 問題の詳細
- googletrans 3.1.0a0（アルファ版）での翻訳処理が不安定
- 本番環境で500エラーが頻発
- 翻訳APIへの接続が不安定

### 一時的な対応
- 翻訳機能を一時的に無効化
- プロンプトをそのまま返すように変更
- サービスの基本機能の安定性を確保

### 恒久的な解決策（予定）
1. 代替の翻訳APIの検討
   - Google Cloud Translate API
   - DeepL API
   - Azure Translator
2. 実装方針
   - 安定したAPIクライアントの使用
   - 適切なエラーハンドリング
   - レート制限への対応
3. 移行計画
   - APIの選定と検証
   - テスト環境での動作確認
   - 段階的な本番環境への適用

### 関連ファイル
- `backend/prompt_utils.py`
- `backend/requirements.txt`

### 備考
翻訳機能は一時的に無効化されていますが、サービスの基本機能は正常に動作しています。

## YAML入力時のPrompt出力順序の問題

### 概要
YAMLを入力した際、`frontend/src/utils/yamlParser.js`が出力するPromptの順序が期待と異なっている。具体的には、Prompt 1とPrompt 2の内容が入れ替わって出力される。

### 問題の詳細
- **入力 (YAML):**
```yaml
Ernst Haeckel style super ancient giant anatomy diagram project
-Comination of scientific arts
-Fusion of myths and science
-Corobockle commentary

Midjourney Prompt generation strategy:
-Promal artistic scientific description
-The detailed anatomical accuracy
-The scientific interpretation of mythical elements

Agent Selection Reason: Claude-3-5-Sonnet is
It is excellent in integrating complex artistic scientific concepts.

Super ancient civilization research -Kamui/kamui formula

claude-3-5-sonnet-20241022

midjourney-v6

Detailed anatomical illustration of an ancient giant's head
in the style of Ernst Haeckel's scientific illustrations.
Precise linework sepia and amber tones with tiny Koropokkuru
scientists explaining each anatomical detail. Hyper-realistic
scientific diagram botanical illustration style
with intricate biological annotations. Vintage scientific
journal aesthetic --ar 3:2 --v 6.0 --q 2

claude-3-5-sonnet-20241022

midjourney-v6

Anatomical cross-section of an ancient giant's upper body
rendered in Ernst Haeckel's meticulous scientific illustration
style. Detailed skeletal and muscular systems with miniature
Koropokkuru researchers pointing out complex biological
structures. Vintage scientific journal aesthetic
sepia and deep green color palette extreme anatomical precision.
--ar 3:2 --v 6.0 --q 2

src/midjourney-prompts/giant-anatomy-01.txt

claude-3-5-sonnet-20241022
```
- **期待される出力:**
  - Prompt 1: Detailed anatomical illustration of an ancient giant's head
in the style of Ernst Haeckel's scientific illustrations.
Precise linework sepia and amber tones with tiny Koropokkuru
scientists explaining each anatomical detail. Hyper-realistic
scientific diagram botanical illustration style
with intricate biological annotations. Vintage scientific
journal aesthetic --ar 3:2 --v 6.0 --q 2
  - Prompt 2: Anatomical cross-section of an ancient giant's upper body
rendered in Ernst Haeckel's meticulous scientific illustration
style. Detailed skeletal and muscular systems with miniature
Koropokkuru researchers pointing out complex biological
structures. Vintage scientific journal aesthetic
sepia and deep green color palette extreme anatomical precision.
--ar 3:2 --v 6.0 --q 2
- **実際の出力:**
  - Prompt 1: Ernst Haeckel style super ancient giant anatomy diagram project ...
  - Prompt 2: Super ancient civilization research -Kamui/kamui formula ...
- **発生箇所:** `frontend/src/utils/yamlParser.js`

### 解決策
`frontend/src/utils/yamlParser.js`のロジックを修正し、Promptが正しい順序で出力されるようにする。

### 関連ファイル
- `frontend/src/utils/yamlParser.js`

### 備考
この問題は、Prompt生成のワークフローを妨げるため、早急な解決が必要。

## YAML入力時の翻訳機能の問題

### 概要
YAMLを入力したときに、不要な部分がPromptとして出力され、また日本語の翻訳機能が動作しない問題が発生。

### 問題の詳細
1. YAMLファイルから`midjourney-prompts`以外の部分も抽出されてしまう
2. 日本語のプロンプトが英語に翻訳されない

### 原因
1. `prompt_utils.py`の`extract_prompts`メソッドがYAMLの構造を正しく解析していなかった
2. `googletrans`の設定が正しく行われていなかった

### 解決策
1. `extract_prompts`メソッドを修正し、`midjourney-prompts`のコンテンツのみを抽出するように変更
```python
def extract_prompts(self, yaml_data: Union[Dict, List, str]) -> List[str]:
    prompts = []
    if not isinstance(yaml_data, dict) or 'src' not in yaml_data:
        return []
    src_data = yaml_data['src']
    if 'midjourney-prompts' in src_data:
        midjourney_prompts = src_data['midjourney-prompts']
        if isinstance(midjourney_prompts, dict):
            for prompt_data in midjourney_prompts.values():
                if isinstance(prompt_data, dict) and 'content' in prompt_data:
                    prompts.append(prompt_data['content'])
    return prompts[:10]
```

2. `googletrans`の設定を復活
- `requirements.txt`に`googletrans==3.1.0a0`を追加
- `prompt_utils.py`で`Translator`クラスの初期化を正しく設定

### 関連ファイル
- `backend/prompt_utils.py`
- `backend/requirements.txt`

### 備考
この修正により、YAMLファイルから正しくプロンプトが抽出され、日本語のプロンプトが英語に翻訳されるようになった。

## [ISSUE-001] YAMLパーサーの実装完了

### 状態
- 開始日: 2025-02-01
- 完了日: 2025-02-01
- 状態: 解決済み
- 優先度: 高

### 実装内容
1. js-yamlパッケージを依存関係に追加
2. YAMLパーサーユーティリティを実装（frontend/src/utils/yamlParser.js）

### 実装された機能
- YAMLテキストのパース（parseYaml）
- JavaScriptオブジェクトのYAML変換（dumpYaml）
- YAML形式の検証（validateYaml）
- エラー詳細の取得（getYamlError）

### コミット履歴
- package.jsonの更新: js-yaml依存関係の追加
- yamlParser.jsの作成: YAMLパーサーユーティリティの実装

### テスト状況
- 基本的なYAMLパース機能
- エラーハンドリング
- 整形オプション（インデント、行幅）

### 関連ファイル
- frontend/package.json
- frontend/src/utils/yamlParser.js