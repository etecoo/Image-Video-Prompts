import yaml
import json
from typing import Dict, List, Optional, Union
import re
import os
import requests
import random

REQUESTY_API_ENDPOINT = "https://requesty.ai/v1"
REQUESTY_API_KEY = os.getenv("REQUESTY_API_KEY")

class PromptOptimizer:
    def __init__(self):
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
        """
        日本語テキストを英語に翻訳する
        requestsを使用して直接Google Translate APIを呼び出す
        """
        if not text or not self.is_japanese(text):
            return text

        try:
            url = "https://translate.googleapis.com/translate_a/single"
            params = {
                "client": "gtx",
                "sl": "ja",
                "tl": "en",
                "dt": "t",
                "q": text
            }
            
            response = requests.get(url, params=params)
            if response.status_code == 200:
                try:
                    result = response.json()
                    if result and isinstance(result, list) and len(result) > 0:
                        translations = result[0]
                        translated_text = ' '.join(t[0] for t in translations if t and len(t) > 0)
                        return translated_text
                except Exception as e:
                    print(f"Translation parsing error: {str(e)}")
                    return text
            else:
                print(f"Translation request failed with status code: {response.status_code}")
                return text

        except Exception as e:
            print(f"Translation error: {str(e)}")
            return text
    def extract_prompts(self, yaml_data: Union[Dict, List, str]) -> List[str]:
        def extract_prompts(self, yaml_data: Union[Dict, List, str]) -> List[str]:
            """YAMLデータから複数のプロンプトを抽出"""
            prompts = []
    
            if not isinstance(yaml_data, dict) or 'src' not in yaml_data:
                return []
    
            src_data = yaml_data['src']
            
            # structure.yamlからプロンプトを抽出
            if 'structure.yaml' in src_data:
                structure = src_data['structure.yaml']
                if isinstance(structure, dict) and 'content' in structure:
                    prompts.append(structure['content'])
    
            # imagesセクションからプロンプトを抽出
            if 'images' in src_data:
                images = src_data['images']
                if isinstance(images, dict):
                    for image_data in images.values():
                        if isinstance(image_data, dict) and 'content' in image_data:
                            prompts.append(image_data['content'])
    
            if not prompts:
                print(f"Available keys in src_data: {list(src_data.keys())}")
                if 'structure.yaml' in src_data:
                    print(f"structure.yaml content: {src_data['structure.yaml']}")
                if 'images' in src_data:
                    print(f"Number of images: {len(src_data['images'])}")
    
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

def optimize_prompt(yaml_data, service='default') -> Union[str, List[str]]:
    """YAMLデータからプロンプトを生成して最適化"""
    try:
        optimizer = PromptOptimizer()
        
        if isinstance(yaml_data, str):
            try:
                yaml_data = load_yaml_content(yaml_data)
            except Exception as e:
                print(f"YAML解析エラー: {str(e)}")
                raise

        if isinstance(yaml_data, dict) and 'elements' in yaml_data:
            result = optimizer.generate_from_elements(yaml_data['elements'], service)
            return result if isinstance(result, str) else str(result)

        prompts = optimizer.extract_prompts(yaml_data)
        if not prompts:
            print("プロンプトが見つかりません。入力データ:", yaml_data)
            raise ValueError("有効なプロンプトが見つかりません")

        optimized = [optimizer.optimize_for_service(prompt, service) for prompt in prompts]
        return optimized

    except Exception as e:
        print(f"optimize_prompt エラー: {str(e)}")
        import traceback
        print(traceback.format_exc())
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