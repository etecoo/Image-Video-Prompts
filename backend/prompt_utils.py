import yaml
import json
from typing import Dict, List, Optional, Union
import re
import os
import requests
import random

REQUESTY_API_ENDPOINT = "https://requesty.ai/v1"
REQUESTY_API_KEY = os.getenv("REQUESTY_API_KEY")

def load_yaml_content(content):
    """YAMLコンテンツをPythonオブジェクトに変換"""
    try:
        return yaml.safe_load(content)
    except yaml.YAMLError as e:
        raise ValueError(f"YAML解析エラー: {str(e)}")

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
        """日本語テキストを英語に翻訳する"""
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

    def extract_prompt_from_content(self, content: str) -> Optional[str]:
        """contentからプロンプトを抽出"""
        # プロンプト詳細の抽出
        prompt_detail_match = re.search(r'プロンプト詳細:[\s]*"([^"]+)"', content, re.DOTALL)
        if prompt_detail_match:
            return prompt_detail_match.group(1).strip()

        # プロンプトセクションの抽出
        if 'プロンプト:' in content:
            prompt_section = content.split('プロンプト:')[1].split('詳細仕様:')[0]
            prompt_lines = []
            for line in prompt_section.split('\n'):
                line = line.strip()
                if line.startswith('-'):
                    prompt_lines.append(line[1:].strip())
            if prompt_lines:
                return ', '.join(prompt_lines)

        return content

    def extract_prompts_from_section(self, section: Dict) -> List[str]:
        """セクションからプロンプトを抽出"""
        prompts = []
        if isinstance(section, dict):
            for item in section.values():
                if isinstance(item, dict) and 'content' in item:
                    prompt = self.extract_prompt_from_content(item['content'])
                    if prompt:
                        prompts.append(prompt)
        return prompts

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

        if isinstance(yaml_data, dict) and 'yaml' in yaml_data:
            yaml_data = yaml_data['yaml']

        prompts = []
        if isinstance(yaml_data, dict) and 'src' in yaml_data:
            src_data = yaml_data['src']
            
            # structure.yamlをスキップ
            for section_key, section in src_data.items():
                if section_key != 'structure.yaml':
                    section_prompts = optimizer.extract_prompts_from_section(section)
                    prompts.extend(section_prompts)

        if not prompts:
            print("プロンプトが見つかりません。データ構造を確認:")
            print(f"Keys at root level: {list(yaml_data.keys() if isinstance(yaml_data, dict) else [])}")
            if isinstance(yaml_data, dict) and 'src' in yaml_data:
                src_data = yaml_data['src']
                print(f"Keys in src: {list(src_data.keys())}")
            raise ValueError("有効なプロンプトが見つかりません")

        # プロンプトを最適化
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
                variation = optimizer.optimize_for_service(
                    ", ".join(modified_elements.values()),
                    service
                )
                variations.append(variation)
        else:
            base_prompt_str = base_prompt if isinstance(base_prompt, str) else str(base_prompt)
            modifiers = [
                ", high quality, detailed",
                ", minimalist, clean",
                ", dramatic lighting",
                ", soft focus",
                ", vibrant colors",
                ", muted tones"
            ]
            
            variations.append(base_prompt_str)
            for _ in range(num_variations - 1):
                variation = base_prompt_str + random.choice(modifiers)
                variations.append(variation)

        return variations

    except Exception as e:
        raise ValueError(f"バリエーション生成エラー: {str(e)}")