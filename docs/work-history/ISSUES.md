## プロンプト抽出機能の改善

### 問題の詳細
1. 特定のYAML形式でプロンプトが抽出できない
2. プロンプト詳細セクションが優先されない
3. structure.yamlセクションが適切にスキップされない

### 解決策
1. プロンプト抽出ロジックの改善
```python
def extract_prompt_from_content(self, content: str) -> Optional[str]:
    # プロンプト詳細の優先抽出
    prompt_detail_match = re.search(r'プロンプト詳細:[\s]*"([^"]+)"', content, re.DOTALL)
    if prompt_detail_match:
        return prompt_detail_match.group(1).strip()
    # ...
```

2. セクション処理の汎用化
```python
def extract_prompts_from_section(self, section: Dict) -> List[str]:
    prompts = []
    if isinstance(section, dict):
        for item in section.values():
            if isinstance(item, dict) and 'content' in item:
                prompt = self.extract_prompt_from_content(item['content'])
                if prompt:
                    prompts.append(prompt)
    return prompts
```

3. structure.yamlのスキップ処理
```python
for section_key, section in src_data.items():
    if section_key != 'structure.yaml':
        section_prompts = optimizer.extract_prompts_from_section(section)
        prompts.extend(section_prompts)
```

### テスト結果
1. 錯覚と知覚の限界を探求.yml
   - 10個のプロンプトを正しく抽出
   - プロンプト詳細から英語プロンプトを優先的に抽出
   - フォーマットが適切に維持

2. 南極の古代地底王国.yaml
   - 10個のプロンプトを正しく抽出
   - midjourney-promptsセクションから適切に抽出
   - 改行とフォーマットが正しく処理

3. 夢と現実の境界を探求する幻想的な視覚シリーズ.yaml
   - 10個のプロンプトを正しく抽出
   - imagesセクションから適切に抽出
   - 日本語から英語への適切な変換

### 再発防止策
1. 複数のYAML形式に対応するテストスクリプトの追加
2. エラーハンドリングとログ出力の強化
3. プロンプト抽出ロジックの汎用化

[以下既存の内容]