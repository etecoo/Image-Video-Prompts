## YAML形式の多様性への対応改善

### 概要
異なるYAML形式（illusion-art, midjourney-prompts, images）のファイルでエラーが発生する問題が報告されました。

### 問題の詳細
1. 特定のYAML形式でのみ動作する制限付きの実装
2. structure.yamlセクションの不適切な処理
3. 英語プロンプトの優先抽出機能の不足

### 解決策
1. YAMLパーサーの柔軟性向上
```javascript
// srcの直下のエントリーを処理
srcEntries.forEach(([sectionKey, section], index) => {
  // structure.yamlはスキップ
  if (sectionKey === 'structure.yaml') {
    console.log('structure.yamlをスキップしました');
    return;
  }

  // 2番目以降のセクションを処理
  if (typeof section === 'object' && section !== null) {
    console.log(`セクション処理開始: ${sectionKey}`);
    Object.entries(section).forEach(([itemKey, item]) => {
      // contentからプロンプトを抽出
      const promptContent = extractPrompt(item.content);
      // ...
    });
  }
});
```

2. プロンプト抽出の改善
```javascript
const extractPrompt = (content) => {
  // プロンプト詳細がある場合はそれを優先
  const promptDetailMatch = content.match(/プロンプト詳細:[\s]*"([^"]+)"/s);
  if (promptDetailMatch) {
    return promptDetailMatch[1].trim();
  }
  // ...
};
```

### 検証結果
以下のYAMLファイルで動作を確認：
1. 錯覚と知覚の限界を探求.yml
   - illusion-artセクションから正しくプロンプトを抽出
   - 英語プロンプトを優先的に使用

2. 南極の古代地底王国.yaml
   - midjourney-promptsセクションから正しくプロンプトを抽出
   - outputセクションのエラーを適切に処理

3. 夢と現実の境界を探求する幻想的な視覚シリーズ.yaml
   - imagesセクションから正しくプロンプトを抽出
   - 日本語コンテンツを適切に処理

### 関連ファイル
- `frontend/src/utils/yamlParser.js`
- `test.js`（テスト用スクリプト）

### 備考
- エラーハンドリングとログ出力を強化し、問題の早期発見と解決を容易に
- 異なるYAML形式に対する柔軟な対応を実現
- テストカバレッジを拡大し、複数のYAML形式での動作を確認

[以下既存の内容]