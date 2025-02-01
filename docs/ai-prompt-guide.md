# AI画像・動画生成サービスのプロンプトガイド

## 画像生成AI

### 1. Midjourney

#### プロンプト構造
```
[主要な説明] [スタイル指定] [技術的パラメーター]
```

#### 特徴的なパラメーター
- --ar [width]:[height] - アスペクト比の指定
- --stylize [1-1000] - スタイライズの強度
- --v [version] - 使用するバージョンの指定
- --q [.25, .5, 1, 2] - 品質設定
- --s [0-1000] - シード値の指定

#### 効果的な記述例
```
A majestic mountain landscape at sunset --ar 16:9 --stylize 100 --q 2
oil painting of a cyberpunk city, in the style of Moebius --v 5
```

### 2. Image FX (Adobe Firefly)

#### プロンプト構造
```
[詳細な説明], [スタイル], [色調], [構図], [テクニカル要素]
```

#### スタイル指定キーワード
- Photographic
- Digital Art
- Vector Art
- Watercolor
- Oil Painting

#### 効果的な記述例
```
Modern minimalist logo design with geometric shapes, blue and white color scheme, suitable for tech company
Professional product photo of a ceramic mug on marble surface, soft lighting, shallow depth of field
```

### 3. Imagen

#### プロンプト構造
```
[詳細な文章による説明], [視覚的要素の指定], [感情や雰囲気の描写]
```

#### 重要な要素
- 自然な文章での記述
- 文脈情報の提供
- 視覚的な詳細の明確化

#### 効果的な記述例
```
A cozy reading nook by a large window on a rainy day, with warm lighting casting soft shadows on vintage furniture
An aerial view of a futuristic city where nature and architecture blend seamlessly, showing environmental harmony
```

### 4. Canva

#### プロンプト構造
```
[用途], [スタイル], [ブランド要素], [具体的なデザイン指示]
```

#### デザイン指定キーワード
- Modern
- Minimalist
- Corporate
- Playful
- Elegant

#### 効果的な記述例
```
Instagram post template with vibrant gradient background, modern typography, and space for product photography
Professional presentation slide with clean layout, company brand colors (blue #1E90FF), and data visualization area
```

### 5. DALL-E 3

#### プロンプト構造
```
[詳細な状況説明], [視覚的要素], [スタイル指定], [技術的な詳細]
```

#### 効果的な要素
- 文脈を含む詳細な説明
- 具体的な視覚要素の指定
- 参照となるスタイルや作品の明示

#### 効果的な記述例
```
A serene Japanese garden viewed through a traditional wooden frame, with cherry blossoms falling in the foreground and a stone lantern casting long shadows at sunset
An isometric illustration of a bustling coffee shop interior with baristas working, customers chatting, and steam rising from coffee machines, in a modern flat design style
```

## 動画生成AI

### 1. Runway ML

#### プロンプト構造
```
[シーン説明], [カメラワーク], [動きの指定], [時間経過], [特殊効果]
```

#### カメラワーク指定
- Tracking Shot
- Dolly Zoom
- Pan
- Tilt
- Aerial View

#### 効果的な記述例
```
Slow tracking shot moving through a neon-lit cyberpunk street market, with holographic advertisements floating in the air, camera gradually rising to reveal the cityscape
Close-up of a blooming flower transitioning from bud to full bloom, with natural lighting changes suggesting time-lapse, shallow depth of field
```

### 2. Sora

#### プロンプト構造
```
[詳細なシーン設定], [動きの流れ], [カメラの動き], [時間経過], [雰囲気や感情]
```

#### 重要な要素
- シーンの文脈説明
- 物理的な動きの詳細
- 時間経過の指定
- 環境の変化

#### 効果的な記述例
```
A serene lake at sunset, with gentle ripples disturbing the reflection of the orange sky. The camera slowly glides across the water's surface, revealing a small wooden dock in the distance
An energetic scene of a professional chef preparing a gourmet dish in a modern kitchen, with quick, precise movements and steam rising from the pan, camera circling around the action
```

### 3. Pika Labs

#### プロンプト構造
```
[アニメーション種類], [動きのスタイル], [タイミング], [強調要素]
```

#### アニメーションスタイル
- Fluid
- Bouncy
- Snappy
- Smooth
- Dynamic

#### 効果的な記述例
```
Smooth transition of geometric shapes morphing into animal silhouettes, with flowing movement and vibrant color changes
Dynamic explosion of colorful paint splashes, freezing mid-air before reforming into a abstract portrait, with emphasis on fluid dynamics
```

### 4. Stable Video Diffusion

#### プロンプト構造
```
[基準画像の説明], [目指す動きの方向], [変化の程度], [時間設定]
```

#### 動きの指定方法
- Direction
- Speed
- Intensity
- Duration
- Transition Type

#### 効果的な記述例
```
Transform still image of autumn leaves into gentle falling motion, with subtle wind effects and natural rotation, medium speed
Convert portrait photo into subtle animated expression change, maintaining photorealistic quality, slow and natural transition
```

### 5. Gen-2 (Runway)

#### プロンプト構造
```
[視覚的参照], [動きの指示], [シーンの展開], [技術的パラメーター]
```

#### 制御パラメーター
- Motion Scale
- Duration
- FPS
- Quality Level

#### 効果的な記述例
```
Based on reference image, create a smooth camera movement through a futuristic corridor, with subtle lighting changes and floating particles, 4 seconds duration at 30fps
Transform still cityscape into dynamic timelapse, with flowing traffic trails and changing cloud patterns, maintaining architectural detail integrity
```

## プロンプト最適化の一般的なヒント

1. 明確性と具体性
   - 曖昧な表現を避ける
   - 具体的な参照例を提供する
   - 数値やパラメーターを適切に使用する

2. 構造化
   - 論理的な順序で情報を配置
   - 関連する要素をグループ化
   - 優先順位を明確に示す

3. コンテキストの提供
   - 目的や用途の明確化
   - 対象となる視聴者や使用環境の説明
   - 必要な技術的要件の指定

4. イテレーティブな改善
   - 生成結果を分析
   - 効果的だった要素を特定
   - 段階的に調整を重ねる

5. プラットフォーム固有の最適化
   - 各サービスの特徴を理解
   - 専用の機能やパラメーターを活用
   - プラットフォームごとの制限を考慮
