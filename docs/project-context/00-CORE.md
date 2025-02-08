# プロジェクト構造と重要な設定

## フロントエンド

### YAML処理モジュール
#### frontend/src/utils/yamlParser.js
YAMLファイルの解析と構造化を行う主要モジュール。

**主要機能:**
1. YAML解析
   - 複数のYAML形式に対応（illusion-art, midjourney-prompts, images）
   - structure.yamlセクションの適切なスキップ
   - エラーハンドリングとログ出力

2. プロンプト抽出
   - プロンプト詳細からの英語プロンプト優先抽出
   - 日本語コンテンツの適切な処理
   - 箇条書き形式のプロンプトの結合

3. パラメータ処理
   - agent, api, dependencyの適切な処理
   - デフォルト値の設定

**使用例:**
```javascript
const { parseYaml, structurePromptData } = require('./yamlParser.js');

// YAMLファイルを解析
const yamlData = parseYaml(yamlContent);

// プロンプトを構造化
const result = structurePromptData(yamlData);

// 結果の利用
result.prompts.forEach(prompt => {
  console.log(prompt.prompt);  // プロンプト内容
  console.log(prompt.parameters);  // パラメータ
});
```

**対応するYAML形式:**
1. illusion-art形式
```yaml
src:
  illusion-art:
    image-name:
      content: |
        説明文
        プロンプト詳細: "English prompt"
      agent: "agent-name"
      api: []
```

2. midjourney-prompts形式
```yaml
src:
  midjourney-prompts:
    prompt-name:
      content: "English prompt"
      agent: "agent-name"
      api: []
```

3. images形式
```yaml
src:
  images:
    image-name:
      content: |
        説明文
        プロンプト: 
        - プロンプト1
        - プロンプト2
      agent: "agent-name"
      api: []
```

[以下既存の内容]