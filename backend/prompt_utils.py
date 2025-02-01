import yaml
import json
from typing import Dict, List, Optional
import re
from googletrans import Translator
import os
import requests

REQUESTY_API_ENDPOINT = "https://router.requesty.ai/v1"
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
            'runway': '[シーン説明], [カメラワーク], [動きの指定], [時間経過], [特殊効果]',
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
                    # フォールバック: googletransを使用
                    return self.translator.translate(text, src='ja', dest='en').text

            except Exception as e:
                print(f"Translation error: {e}")
                # エラー時はgoogletransを使用
                return self.translator.translate(text, src='ja', dest='en').text
        return text

    def extract_prompt(self, yaml_data: Dict) -> str:
        """YAMLデータからプロンプト部分を抽出"""
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
        
        # プロンプトが見つからない場合は、最初の文字列値を使用
        if not prompt:
            for value in yaml_data.values():
                if isinstance(value, str):
                    prompt = value
                    break

        return prompt

    def optimize_for_service(self, prompt: str, service: str) -> str:
        """サービスごとのプロンプト最適化"""
        service = service.lower()
        
        # プロンプトを英語に変換
        prompt = self.translate_to_english(prompt)

        if service in self.service_params:
            params = self.service_params[service]
            
            # 長さの制限
            if 'max_length' in params:
                prompt = prompt[:params['max_length']]

            # サービス固有のパラメータ処理
            if service == 'midjourney':
                if not any(param in prompt for param in params['params']):
                    prompt += ' --v 5 --q 2'  # デフォルトパラメータ
            
            elif service == 'imagefx':
                if not any(style in prompt for style in params['styles']):
                    prompt += ', Digital Art style'

        # プロンプトパターンに合わせて構造化
        if service in self.service_patterns:
            pattern = self.service_patterns[service]
            if not re.search(r'[\[\],]', prompt):  # プロンプトが既に構造化されていない場合
                sections = pattern.split('] ')
                structured_prompt = prompt
                for section in sections:
                    if section and '[' in section:
                        section_name = section.split('[')[1]
                        if section_name not in prompt:
                            structured_prompt += f", {section_name}"
                prompt = structured_prompt

        return prompt

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

        # プロンプトの抽出
        prompt = optimizer.extract_prompt(yaml_data)
        
        # サービスごとの最適化
        optimized_prompt = optimizer.optimize_for_service(prompt, service)

        return optimized_prompt

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
                    variation += ", high quality, detailed"
                else:
                    variation += ", minimalist, clean"
                variations.append(variation)

        return variations

    except Exception as e:
        raise ValueError(f"バリエーション生成エラー: {str(e)}")