import yaml
import json

def load_yaml_content(content):
    """YAMLコンテンツをPythonオブジェクトに変換"""
    try:
        return yaml.safe_load(content)
    except yaml.YAMLError as e:
        raise ValueError(f"YAML解析エラー: {str(e)}")

def optimize_prompt(yaml_data, service='default'):
    """YAMLデータからプロンプトを生成して最適化"""
    try:
        if isinstance(yaml_data, str):
            yaml_data = load_yaml_content(yaml_data)

        # プロンプトの構造を解析
        prompt_parts = []

        # 基本情報の追加
        if 'title' in yaml_data:
            prompt_parts.append(f"タイトル: {yaml_data['title']}")
        
        if 'description' in yaml_data:
            prompt_parts.append(f"説明: {yaml_data['description']}")

        # キャラクター情報の処理
        if 'characters' in yaml_data:
            chars = yaml_data['characters']
            if isinstance(chars, list):
                for char in chars:
                    if isinstance(char, dict):
                        char_desc = []
                        for key, value in char.items():
                            char_desc.append(f"{key}: {value}")
                        prompt_parts.append("キャラクター情報:\n" + "\n".join(char_desc))
            elif isinstance(chars, dict):
                char_desc = []
                for key, value in chars.items():
                    char_desc.append(f"{key}: {value}")
                prompt_parts.append("キャラクター情報:\n" + "\n".join(char_desc))

        # シーン情報の処理
        if 'scene' in yaml_data:
            scene = yaml_data['scene']
            if isinstance(scene, dict):
                scene_desc = []
                for key, value in scene.items():
                    scene_desc.append(f"{key}: {value}")
                prompt_parts.append("シーン情報:\n" + "\n".join(scene_desc))
            else:
                prompt_parts.append(f"シーン: {scene}")

        # スタイル情報の処理
        if 'style' in yaml_data:
            style = yaml_data['style']
            if isinstance(style, dict):
                style_desc = []
                for key, value in style.items():
                    style_desc.append(f"{key}: {value}")
                prompt_parts.append("スタイル情報:\n" + "\n".join(style_desc))
            else:
                prompt_parts.append(f"スタイル: {style}")

        # 追加パラメータの処理
        if 'parameters' in yaml_data:
            params = yaml_data['parameters']
            if isinstance(params, dict):
                param_desc = []
                for key, value in params.items():
                    param_desc.append(f"{key}: {value}")
                prompt_parts.append("パラメータ:\n" + "\n".join(param_desc))

        # サービス固有の最適化
        if service == 'midjourney':
            prompt = " --".join(prompt_parts)
            prompt = prompt.replace("\n", " ")
        else:
            prompt = "\n\n".join(prompt_parts)

        return prompt

    except Exception as e:
        raise ValueError(f"プロンプト生成エラー: {str(e)}")

def generate_variations(prompt, num_variations=1):
    """プロンプトのバリエーションを生成"""
    try:
        variations = []
        base_prompt = prompt

        # 基本的なバリエーション生成
        for i in range(num_variations):
            if i == 0:
                variations.append(base_prompt)
            else:
                # バリエーションごとに少しずつ異なる表現を追加
                variation = base_prompt
                if i % 2 == 0:
                    variation += "\n高品質で詳細な表現"
                else:
                    variation += "\nシンプルで明確な表現"
                variations.append(variation)

        return variations

    except Exception as e:
        raise ValueError(f"バリエーション生成エラー: {str(e)}")