const { parseYaml, structurePromptData } = require('./frontend/src/utils/yamlParser.js');
const fs = require('fs');
const path = require('path');

const testFiles = [
  '/Users/ete/Projects/prismancer/YAML/錯覚と知覚の限界を探求.yml',
  '/Users/ete/Projects/prismancer/YAML/南極の古代地底王国.yaml',
  '/Users/ete/Projects/prismancer/YAML/夢と現実の境界を探求する幻想的な視覚シリーズ.yaml'
];

const processYamlFile = (filePath) => {
  console.log(`\n=== テスト: ${path.basename(filePath)} ===`);
  try {
    console.log('YAMLファイルを読み込み中...');
    const yamlContent = fs.readFileSync(filePath, 'utf8');
    
    console.log('YAMLをパース中...');
    const yamlData = parseYaml(yamlContent);
    
    console.log('プロンプトを構造化中...');
    const result = structurePromptData(yamlData);

    // 結果を表示
    console.log('\n--- 結果 ---');
    console.log(`総プロンプト数: ${result.prompts.length}`);
    console.log('\n--- 各プロンプトの内容 ---');
    result.prompts.forEach((prompt, index) => {
      console.log(`\n[プロンプト ${index + 1}]`);
      console.log(`Content: ${prompt.prompt.substring(0, 100)}...`);
      console.log('Parameters:', JSON.stringify(prompt.parameters, null, 2));
    });

    if (result.errors.length > 0) {
      console.log('\n--- エラー ---');
      result.errors.forEach(error => console.log(error));
    }

    return true;
  } catch (error) {
    console.error('エラーが発生しました:', error);
    return false;
  }
};

// 各ファイルをテスト
let successCount = 0;
testFiles.forEach(file => {
  if (processYamlFile(file)) {
    successCount++;
  }
});

console.log(`\n=== テスト完了 ===`);
console.log(`成功: ${successCount}/${testFiles.length} ファイル`);