import yaml from 'js-yaml';

/**
 * Midjourneyパラメータを抽出する正規表現パターン
 */
const MIDJOURNEY_PARAM_PATTERN = /--(?:ar|v|style|q|s)\s+[^\s,]+/g;

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
  if (!yamlData) {
    return { prompts: [], errors: [] };
  }

  const structured = { prompts: [], errors: [] };
  let promptId = 1;

  if (yamlData.src) {
    for (const key in yamlData.src) {
      if (yamlData.src.hasOwnProperty(key)) {
        const item = yamlData.src[key];
        if (item && item.content && key !== 'structure.yaml') {
          const contentMatch = item.content.match(/プロンプト:\s*([\s\S]*?)(?:\s*ビジュアル要素:|$)/);
          let originalContent = contentMatch ? contentMatch[1].trim() : '';
          if (!originalContent) {
            structured.errors.push(`プロンプトが見つかりませんでした: ${key}`);
            continue;
          }
          originalContent = originalContent.split('\n')
            .filter(line => line.trim() && line.trim() !== 'プロンプト:')
            .map(line => line.trim().startsWith('- ') ? line.trim().substring(2) : line.trim())
            .join('\n');
          const translatedPrompt = translateToEnglish(originalContent);
          const parameters = { ...item };
          delete parameters.content;
          structured.prompts.push({
            prompt: translatedPrompt,
            content: originalContent,
            parameters: parameters,
            id: promptId++,
          });
        }
      }
    }
  }

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