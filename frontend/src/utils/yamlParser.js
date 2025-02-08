const yaml = require('js-yaml');

/**
 * YAMLテキストをJavaScriptオブジェクトに変換
 * @param {string} yamlText - 変換するYAMLテキスト
 * @returns {Object} 変換されたJavaScriptオブジェクト
 * @throws {Error} YAML解析エラー
 */
const parseYaml = (yamlText) => {
  try {
    return yaml.load(yamlText);
  } catch (error) {
    console.error('YAML解析エラー:', error);
    throw new Error(`YAML解析エラー: ${error.message}`);
  }
};

/**
 * contentからプロンプトを抽出
 * @param {string} content - コンテンツ文字列
 * @returns {string} 抽出されたプロンプト
 */
const extractPrompt = (content) => {
  // プロンプト詳細がある場合はそれを優先
  const promptDetailMatch = content.match(/プロンプト詳細:[\s]*"([^"]+)"/s);
  if (promptDetailMatch) {
    return promptDetailMatch[1].trim();
  }

  // プロンプト:セクションの抽出
  const promptMatch = content.match(/プロンプト:([^詳細仕様]*)/s);
  if (promptMatch) {
    // 箇条書きの項目を抽出して結合
    const bulletPoints = promptMatch[1]
      .split('\n')
      .filter(line => line.trim().startsWith('-'))
      .map(line => line.replace(/^-\s*/, '').trim())
      .filter(line => line);
    
    if (bulletPoints.length > 0) {
      return bulletPoints.join(', ');
    }
  }

  // どちらもない場合は元のコンテンツを返す
  return content;
};

/**
 * プロンプトデータを構造化
 * @param {Object} yamlData - パースされたYAMLデータ
 * @returns {Object} 構造化されたプロンプトデータ
 */
const structurePromptData = (yamlData) => {
  const structured = { prompts: [], errors: [] };
  let promptId = 1;

  if (!yamlData || !yamlData.src) {
    return { prompts: [], errors: [] };
  }

  const srcEntries = Object.entries(yamlData.src);
  
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
        if (!item || !item.content) {
          structured.errors.push(`contentが見つかりませんでした: ${sectionKey}/${itemKey}`);
          return;
        }

        // contentからプロンプトを抽出
        const promptContent = extractPrompt(item.content);

        structured.prompts.push({
          prompt: promptContent,
          content: item.content,
          parameters: {
            agent: item.agent || null,
            api: item.api || [],
            dependency: item.dependency || []
          },
          id: promptId++,
        });
        console.log(`プロンプト抽出: ${itemKey}`);
      });
    }
  });

  // デバッグ情報の出力
  console.log(`処理されたセクション: ${srcEntries.length}`);
  console.log(`抽出されたプロンプト: ${structured.prompts.length}`);
  if (structured.errors.length > 0) {
    console.log('エラー:', structured.errors);
  }

  return structured;
};

/**
 * JavaScriptオブジェクトをYAMLテキストに変換
 * @param {Object} data - 変換するJavaScriptオブジェクト
 * @returns {string} 変換されたYAMLテキスト
 * @throws {Error} YAML変換エラー
 */
const dumpYaml = (data) => {
  try {
    return yaml.dump(data, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
    });
  } catch (error) {
    console.error('YAML変換エラー:', error);
    throw new Error(`YAML変換エラー: ${error.message}`);
  }
};

/**
 * YAMLファイルの検証
 * @param {string} yamlText - 検証するYAMLテキスト
 * @returns {boolean} 有効なYAMLの場合true
 */
const validateYaml = (yamlText) => {
  try {
    yaml.load(yamlText);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * YAMLのエラー詳細を取得
 * @param {string} yamlText - 検証するYAMLテキスト
 * @returns {string|null} エラーメッセージ（エラーがない場合はnull）
 */
const getYamlError = (yamlText) => {
  try {
    yaml.load(yamlText);
    return null;
  } catch (error) {
    return error.message;
  }
};

module.exports = {
  parseYaml,
  structurePromptData,
  dumpYaml,
  validateYaml,
  getYamlError
};