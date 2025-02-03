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
 * プロンプトからMidjourneyパラメータを抽出（パラメータは無視し、プロンプト本文のみ抽出）
 * - 複数行の場合（YAMLブロックリテラル対応）は、全行を結合して翻訳後に返す
 * - 単一行の場合は、' --'以降のパラメータ部分を除去して返す
 * @param {string} promptText - プロンプトテキスト
 * @returns {Object} { prompt: プロンプト本文, parameters: {} }
 */
export const extractMidjourneyParams = (promptText) => {
  if (promptText.includes('\n')) {
    // 複数行の場合：全行を結合して英語に翻訳する
    const lines = promptText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const combined = lines.join('\n');
    const translated = translateToEnglish(combined);
    return {
      prompt: translated,
      parameters: {}
    };
  } else {
    // 単一行の場合：' --' 以降を無視
    const index = promptText.indexOf(' --');
    let cleanPrompt;
    if (index !== -1) {
      cleanPrompt = promptText.substring(0, index).trim();
    } else {
      cleanPrompt = promptText.trim();
    }
    return {
      prompt: cleanPrompt,
      parameters: {}
    };
  }
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

      if (value && typeof value === 'object') {
        let promptContent = null;
        let metadata = {};

        if ('content' in value) {
          promptContent = value.content;
          metadata = {
            agent: value.agent,
            dependency: value.dependency,
            api: value.api
          };
        } else if ('prompt' in value) {
          promptContent = value.prompt;
        }

        if (promptContent) {
          const { prompt, parameters } = extractMidjourneyParams(promptContent);
          structured.prompts.push({
            id: currentPath,
            content: prompt,
            parameters,
            metadata
          });
        }
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