## YAML入力時のPrompt出力順序の問題

### 概要
YAMLを入力した際、`frontend/src/utils/yamlParser.js`が出力するPromptの順序が期待と異なっている。具体的には、Prompt 1とPrompt 2の内容が入れ替わって出力される。

### 問題の詳細
- **入力 (YAML):**
```yaml
Ernst Haeckel style super ancient giant anatomy diagram project
-Comination of scientific arts
-Fusion of myths and science
-Corobockle commentary

Midjourney Prompt generation strategy:
-Promal artistic scientific description
-The detailed anatomical accuracy
-The scientific interpretation of mythical elements

Agent Selection Reason: Claude-3-5-Sonnet is
It is excellent in integrating complex artistic scientific concepts. 

Super ancient civilization research -Kamui/kamui formula 

claude-3-5-sonnet-20241022 

midjourney-v6 

Detailed anatomical illustration of an ancient giant's head, 
in the style of Ernst Haeckel's scientific illustrations. 
Precise linework, sepia and amber tones, with tiny Koropokkuru 
scientists explaining each anatomical detail. Hyper-realistic 
scientific diagram, botanical illustration style, 
with intricate biological annotations. Vintage scientific 
journal aesthetic, --ar 3:2 --v 6.0 --q 2 

claude-3-5-sonnet-20241022 

midjourney-v6 

Anatomical cross-section of an ancient giant's upper body, 
rendered in Ernst Haeckel's meticulous scientific illustration 
style. Detailed skeletal and muscular systems, with miniature 
Koropokkuru researchers pointing out complex biological 
structures. Vintage scientific journal aesthetic, 
sepia and deep green color palette, extreme anatomical precision. 
--ar 3:2 --v 6.0 --q 2 

src/midjourney-prompts/giant-anatomy-01.txt 

claude-3-5-sonnet-20241022 
```
- **期待される出力:**
  - Prompt 1: Detailed anatomical illustration of an ancient giant's head, 
in the style of Ernst Haeckel's scientific illustrations. 
Precise linework, sepia and amber tones, with tiny Koropokkuru 
scientists explaining each anatomical detail. Hyper-realistic 
scientific diagram, botanical illustration style, 
with intricate biological annotations. Vintage scientific 
journal aesthetic, --ar 3:2 --v 6.0 --q 2
  - Prompt 2: Anatomical cross-section of an ancient giant's upper body, 
rendered in Ernst Haeckel's meticulous scientific illustration 
style. Detailed skeletal and muscular systems, with miniature 
Koropokkuru researchers pointing out complex biological 
structures. Vintage scientific journal aesthetic, 
sepia and deep green color palette, extreme anatomical precision. 
--ar 3:2 --v 6.0 --q 2
- **実際の出力:**
  - Prompt 1: Ernst Haeckel style super ancient giant anatomy diagram project ...
  - Prompt 2: Super ancient civilization research -Kamui/kamui formula ...
- **発生箇所:** `frontend/src/utils/yamlParser.js`

### 解決策
`frontend/src/utils/yamlParser.js`のロジックを修正し、Promptが正しい順序で出力されるようにする。

### 関連ファイル
- `frontend/src/utils/yamlParser.js`

### 備考
この問題は、Prompt生成のワークフローを妨げるため、早急な解決が必要。