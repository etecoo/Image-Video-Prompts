import yaml from 'js-yaml';

/**
 *
 */


/**
 * YAMLテキストをJavaScriptオブジェクトに変換
 * @param {string} yamlText - 変換するYAMLテキスト
 * @returns {Object} 変換されたJavaScriptオブジェクト
 * @throws {Error} YAML解析エラー
 */
export const parseYaml = (yamlText) => {
  try {
    return yaml.load(yamlText);
  } catch (error) {
    console.error('YAML解析エラー:', error);
    throw new Error(`YAML解析エラー: ${error.message}`);
  }
};

/**
 * ダミーの翻訳関数
 * 実際の翻訳APIに置き換えることが可能です。
 */
export const translateToEnglish = (text) => {
  return text + " [English translation]";
};


/**
 * プロンプトデータを構造化
 * @param {Object} yamlData - パースされたYAMLデータ
 * @returns {Object} 構造化されたプロンプトデータ
 */
export const structurePromptData = (yamlData) => {
  const structured = { prompts: [], errors: [] };
  let promptId = 1;

  if (!yamlData || !yamlData.src) {
    return { prompts: [], errors: [] };
  }

  const srcEntries = Object.entries(yamlData.src);
  const midjourneyPrompts = [];

  // midjourney-promptsのcontentを順番に取得
  for (const [key, promptCategory] of srcEntries) {
    if (key === 'midjourney-prompts' && typeof promptCategory === 'object' && promptCategory !== null) {
      for (const promptKey of Object.keys(promptCategory)) {
        const item = promptCategory[promptKey];
        if (item && item.content) {
          midjourneyPrompts.push(item.content);
        } else {
          structured.errors.push(`contentが見つかりませんでした: ${key} - ${promptKey}`);
        }
      }
    }
  }

  // structure.yamlのcontentを先頭に追加
  for (const [key, promptCategory] of srcEntries) {
    if (key === 'structure.yaml' && typeof promptCategory === 'object' && promptCategory !== null) {
      for (const promptKey of Object.keys(promptCategory)) {
        const item = promptCategory[promptKey];
        if (item && item.content) {
          structured.prompts.push({
            prompt: item.content,
            content: item.content,
            parameters: {},
            id: promptId++,
          });
        } else {
          structured.errors.push(`contentが見つかりませんでした: ${key} - ${promptKey}`);
        }
      }
    }
  }

  // midjourney-promptsのcontentを順番に追加
  midjourneyPrompts.forEach(content => {
    structured.prompts.push({
      prompt: translateToEnglish(content),
      content: content,
      parameters: {},
      id: promptId++,
    });
  });

  return structured;
};

/**
 * JavaScriptオブジェクトをYAMLテキストに変換
 * @param {Object} data - 変換するJavaScriptオブジェクト
 * @returns {string} 変換されたYAMLテキスト
 * @throws {Error} YAML変換エラー
 */
export const dumpYaml = (data) => {
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
export const validateYaml = (yamlText) => {
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
export const getYamlError = (yamlText) => {
  try {
    yaml.load(yamlText);
    return null;
  } catch (error) {
    return error.message;
  }
};