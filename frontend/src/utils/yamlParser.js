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
 * プロンプトからMidjourneyパラメータを抽出
 * @param {string} promptText - プロンプトテキスト
 * @returns {Object} プロンプト本文とパラメータ
 */
export const extractMidjourneyParams = (promptText) => {
  const params = promptText.match(MIDJOURNEY_PARAM_PATTERN) || [];
  const cleanPrompt = promptText
    .replace(MIDJOURNEY_PARAM_PATTERN, '')
    .replace(/,\s*$/, '')
    .trim();

  const paramObj = {};
  params.forEach(param => {
    const [key, value] = param.split(/\s+/);
    paramObj[key.slice(2)] = value; // '--'を除去
  });

  return {
    prompt: cleanPrompt,
    parameters: paramObj
  };
};

/**
 * プロンプトデータを構造化
 * @param {Object} yamlData - パースされたYAMLデータ
 * @returns {Object} 構造化されたプロンプトデータ
 */
export const structurePromptData = (yamlData) => {
  const structured = {
    project: null,
    prompts: []
  };

  // プロジェクト情報の抽出
  if (yamlData.src?.['structure.yaml']?.content) {
    structured.project = {
      title: yamlData.src['structure.yaml'].content.split('\n')[0],
      strategy: yamlData.src['structure.yaml'].content
        .split('\n')
        .slice(1)
        .filter(line => line.trim().startsWith('-'))
        .map(line => line.trim().slice(2)),
      agent: yamlData.src['structure.yaml'].agent
    };
  }

  // プロンプトの抽出と構造化
  const extractPromptsRecursively = (obj, path = '') => {
    if (typeof obj !== 'object' || obj === null) return;

    Object.entries(obj).forEach(([key, value]) => {
      const currentPath = path ? `${path}/${key}` : key;

      if (value && typeof value === 'object' && 'content' in value) {
        // contentプロパティを持つオブジェクトをプロンプトとして処理
        const { prompt, parameters } = extractMidjourneyParams(value.content);
        structured.prompts.push({
          id: currentPath,
          content: prompt,
          parameters,
          metadata: {
            agent: value.agent,
            dependency: value.dependency,
            api: value.api
          }
        });
      }

      // オブジェクトを再帰的に探索
      extractPromptsRecursively(value, currentPath);
    });
  };

  if (yamlData.src) {
    extractPromptsRecursively(yamlData.src);
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