import yaml
import json
from typing import Dict, List, Optional, Union
import re
from googletrans import Translator
import os
import requests
import random

REQUESTY_API_ENDPOINT = "https://requesty.ai/v1"
REQUESTY_API_KEY = os.getenv("REQUESTY_API_KEY")

class PromptOptimizer:
    def __init__(self):
        self.translator = Translator()
        self.service_patterns = {
            'midjourney': '[主要な説明] [スタイル指定] [技術的パラメーター]',
            'imagefx': '[詳細な説明], [スタイル], [色調], [構図], [テクニカル要素]',
            'imagen': '[詳細な文章による説明], [視覚的要素の指定], [感情や雰囲気の描写]',
            'canva': '[用途], [スタイル], [ブランド要素], [具体的なデザイン指示]',
            'dalle': '[詳細な状況説明], [視覚的要素], [スタイル指定], [技術的な詳細]',
            'runway_image': '[詳細な説明], [視覚的要素], [スタイル指定], [技術的な詳細]',
            'runway_video': '[シーン説明], [カメラワーク], [動きの指定], [時間経過], [特殊効果]',
            'sora': '[詳細なシーン設定], [動きの流れ], [カメラの動き], [時間経過], [雰囲気や感情]',
            'pika': '[アニメーション種類], [動きのスタイル], [タイミング], [強調要素]',
            'stable_video': '[基準画像の説明], [目指す動きの方向], [変化の程度], [時間設定]',
            'gen2': '[視覚的参照], [動きの指示], [シーンの展開], [技術的パラメーター]'
        }
        self.service_params = {
            'midjourney': {
                'max_length': 500,
                'params': ['--ar', '--stylize', '--v', '--q', '--s']
            },
            'imagefx': {
                'max_length': 400,
                'styles': ['Photographic', 'Digital Art', 'Vector Art', 'Watercolor', 'Oil Painting']
            },
            'dalle': {
                'max_length': 400
            }
        }

    def is_japanese(self, text: str) -> bool:
        return bool(re.search(r'[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]', text))

    def translate_to_english(self, text: str) -> str:
        if self.is_japanese(text):
            try:
                if not REQUESTY_API_KEY:
                    raise ValueError("REQUESTY_API_KEY is not set")

                response = requests.post(
                    f"{REQUESTY_API_ENDPOINT}/translate",
                    headers={
                        "Authorization": f"Bearer {REQUESTY_API_KEY}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "text": text,
                        "source_lang": "ja",
                        "target_lang": "en"
                    }
                )

                if response.status_code == 200:
                    return response.json()["translated_text"]
                else:
                    print(f"Translation API error: {response.text}")
                    return self.translator.translate(text, src='ja', dest='en').text

            except Exception as e:
                print(f"Translation error: {e}")
                return self.translator.translate(text, src='ja', dest='en').text
        return text

    def extract_prompts(self, yaml_data: Union[Dict, List, str]) -> List[str]:
        """YAMLデータから複数のプロンプトを抽出"""
        prompts = []

        def extract_nested_prompts(data):
            if isinstance(data, str):
                prompts.append(data)
            elif isinstance(data, list):
                for item in data:
                    extract_nested_prompts(item)
            elif isinstance(data, dict):
                for value in data.values():
                    if isinstance(value, dict) and 'prompt' in value:
                        prompts.append(value['prompt'])
                    else:
                        extract_nested_prompts(value)

        extract_nested_prompts(yaml_data)
        return prompts[:10]  # 最大10個のプロンプトを返す

    def extract_prompt(self, yaml_data: Dict) -> str:
        """YAMLデータから単一のプロンプトを抽出"""
        if isinstance(yaml_data, str):
            return yaml_data

        prompt = ""
        if 'prompt' in yaml_data:
            return yaml_data['prompt']
        elif 'description' in yaml_data:
            prompt = yaml_data['description']
        elif 'text' in yaml_data:
            prompt = yaml_data['text']
        elif 'content' in yaml_data:
            prompt = yaml_data['content']
        
        if not prompt:
            for value in yaml_data.values():
                if isinstance(value, str):
                    prompt = value
                    break

        return prompt

    def optimize_for_service(self, prompt: str, service: str) -> str:
        """サービスごとのプロンプト最適化"""
        service = service.lower()
        
        prompt = self.translate_to_english(prompt)

        if service in self.service_params:
            params = self.service_params[service]
            
            if 'max_length' in params:
                prompt = prompt[:params['max_length']]

            if service == 'midjourney':
                if not any(param in prompt for param in params['params']):
                    prompt += ' --v 5 --q 2'
            
            elif service == 'imagefx':
                if not any(style in prompt for style in params['styles']):
                    prompt += ', Digital Art style'

        if service in self.service_patterns:
            pattern = self.service_patterns[service]
            if not re.search(r'[\[\],]', prompt):
                sections = pattern.split('] ')
                structured_prompt = prompt
                for section in sections:
                    if section and '[' in section:
                        section_name = section.split('[')[1]
                        if section_name not in prompt:
                            structured_prompt += f", {section_name}"
                prompt = structured_prompt

        return prompt

    def generate_from_elements(self, elements: Dict[str, str], service: str) -> str:
        """要素ベースのプロンプト生成"""
        prompt_parts = []
        
        # 主要な要素
        if elements.get('subject'):
            prompt_parts.append(self.translate_to_english(elements['subject']))
        
        if elements.get('action'):
            prompt_parts.append(self.translate_to_english(elements['action']))
        
        # 環境と時間
        environment_parts = []
        if elements.get('environment'):
            environment_parts.append(self.translate_to_english(elements['environment']))
        if elements.get('when'):
            environment_parts.append(self.translate_to_english(elements['when']))
        if environment_parts:
            prompt_parts.append(f"in {', '.join(environment_parts)}")
        
        # 雰囲気とスタイル
        if elements.get('mood'):
            prompt_parts.append(f"with {self.translate_to_english(elements['mood'])} mood")
        
        if elements.get('style'):
            prompt_parts.append(f"in {self.translate_to_english(elements['style'])} style")
        
        # カメラワーク
        camera_parts = []
        if elements.get('cameraAngle'):
            camera_parts.append(f"from {elements['cameraAngle'].replace('_', ' ')}")
        if elements.get('shotType'):
            camera_parts.append(elements['shotType'].replace('_', ' '))
        if elements.get('perspective'):
            camera_parts.append(f"with {elements['perspective'].replace('_', ' ')}")
        if camera_parts:
            prompt_parts.append(f"shot {', '.join(camera_parts)}")
        
        # 構図
        composition_parts = []
        if elements.get('compositionRule'):
            composition_parts.append(elements['compositionRule'].replace('_', ' '))
        if elements.get('compositionTechnique') and elements['compositionTechnique'] != 'none':
            composition_parts.append(elements['compositionTechnique'].replace('_', ' '))
        if composition_parts:
            prompt_parts.append(f"using {', '.join(composition_parts)} composition")
        
        # 照明
        lighting_parts = []
        if elements.get('lightingDirection'):
            lighting_parts.append(elements['lightingDirection'].replace('_', ' '))
        if elements.get('lightingType'):
            lighting_parts.append(elements['lightingType'].replace('_', ' '))
        if lighting_parts:
            prompt_parts.append(f"with {', '.join(lighting_parts)} lighting")
        
        # 詳細と色
        if elements.get('details'):
            prompt_parts.append(self.translate_to_english(elements['details']))
        
        if elements.get('colorPalette'):
            prompt_parts.append(f"using {self.translate_to_english(elements['colorPalette'])} colors")

        base_prompt = ", ".join(filter(None, prompt_parts))
        return self.optimize_for_service(base_prompt, service)

def load_yaml_content(content):
    """YAMLコンテンツをPythonオブジェクトに変換"""
    try:
        return yaml.safe_load(content)
    except yaml.YAMLError as e:
        raise ValueError(f"YAML解析エラー: {str(e)}")

def optimize_prompt(yaml_data, service='default'):
    """YAMLデータからプロンプトを生成して最適化"""
    try:
        optimizer = PromptOptimizer()
        
        if isinstance(yaml_data, str):
            yaml_data = load_yaml_content(yaml_data)

        if isinstance(yaml_data, dict) and 'elements' in yaml_data:
            return optimizer.generate_from_elements(yaml_data['elements'], service)

        prompts = optimizer.extract_prompts(yaml_data)
        if not prompts:
            raise ValueError("有効なプロンプトが見つかりません")

        return [optimizer.optimize_for_service(prompt, service) for prompt in prompts]

    except Exception as e:
        raise ValueError(f"プロンプト生成エラー: {str(e)}")

def generate_variations(base_prompt: Union[str, Dict], num_variations: int = 1) -> List[str]:
    """プロンプトのバリエーションを生成"""
    try:
        optimizer = PromptOptimizer()
        variations = []

        if isinstance(base_prompt, dict) and 'elements' in base_prompt:
            elements = base_prompt['elements']
            service = base_prompt.get('service', 'default')
            
            for _ in range(num_variations):
                modified_elements = {
                    key: value + random.choice([
                        ", detailed", ", minimalist", ", dramatic", 
                        ", subtle", ", intense", ", balanced"
                    ]) if random.random() > 0.5 else value
                    for key, value in elements.items()
                }
                variation = optimizer.generate_from_elements(modified_elements, service)
                variations.append(variation)
        else:
            base_prompt_str = base_prompt if isinstance(base_prompt, str) else optimizer.extract_prompt(base_prompt)
            modifiers = [
                ", high quality, detailed",
                ", minimalist, clean",
                ", dramatic lighting",
                ", soft focus",
                ", vibrant colors",
                ", muted tones"
            ]
            
            for i in range(num_variations):
                if i == 0:
                    variations.append(base_prompt_str)
                else:
                    variation = base_prompt_str + random.choice(modifiers)
                    variations.append(variation)

        return variations

    except Exception as e:
        raise ValueError(f"バリエーション生成エラー: {str(e)}")