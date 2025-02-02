import { useState } from 'react';
import { parseYaml, validateYaml, getYamlError } from './utils/yamlParser';
import './App.css';

function App() {
  const [mode, setMode] = useState('convert'); // 'convert' or 'generate'
  const [yamlContent, setYamlContent] = useState(null);
  const [promptCount, setPromptCount] = useState(3);
  const [service, setService] = useState('midjourney');
  const [error, setError] = useState(null);
  const [prompts, setPrompts] = useState([]);
  const [promptElements, setPromptElements] = useState({
    subject: '',
    environment: '',
    when: '',
    action: '',
    mood: '',
    style: '',
    details: '',
    colorPalette: '',
    // カメラワーク
    cameraAngle: 'eye_level',
    shotType: 'medium',
    perspective: 'one_point',
    // 構図
    compositionRule: 'rule_of_thirds',
    compositionTechnique: 'none',
    // 照明
    lightingDirection: 'front',
    lightingType: 'natural'
  });

  const cameraAngles = [
    { id: 'eye_level', name: 'Eye Level' },
    { id: 'low_angle', name: 'Low Angle' },
    { id: 'high_angle', name: 'High Angle' },
    { id: 'birds_eye', name: 'Bird\'s Eye View' },
    { id: 'dutch_angle', name: 'Dutch Angle' }
  ];

  const shotTypes = [
    { id: 'extreme_close_up', name: 'Extreme Close-up' },
    { id: 'close_up', name: 'Close-up' },
    { id: 'medium', name: 'Medium Shot' },
    { id: 'long', name: 'Long Shot' },
    { id: 'extreme_long', name: 'Extreme Long Shot' }
  ];

  const perspectives = [
    { id: 'one_point', name: 'One-Point Perspective' },
    { id: 'two_point', name: 'Two-Point Perspective' },
    { id: 'three_point', name: 'Three-Point Perspective' }
  ];

  const compositionRules = [
    { id: 'rule_of_thirds', name: 'Rule of Thirds' },
    { id: 'golden_ratio', name: 'Golden Ratio' },
    { id: 'center', name: 'Central Composition' },
    { id: 'diagonal', name: 'Diagonal Composition' },
    { id: 's_curve', name: 'S-Curve Composition' }
  ];

  const compositionTechniques = [
    { id: 'none', name: 'None' },
    { id: 'leading_lines', name: 'Leading Lines' },
    { id: 'frame_in_frame', name: 'Frame within Frame' },
    { id: 'symmetry', name: 'Symmetry' },
    { id: 'pattern', name: 'Pattern' }
  ];

  const lightingDirections = [
    { id: 'front', name: 'Front Lighting' },
    { id: 'side', name: 'Side Lighting' },
    { id: 'back', name: 'Back Lighting' },
    { id: 'top', name: 'Top Lighting' },
    { id: 'under', name: 'Under Lighting' }
  ];

  const lightingTypes = [
    { id: 'natural', name: 'Natural Light' },
    { id: 'artificial', name: 'Artificial Light' },
    { id: 'rim', name: 'Rim Light' }
  ];

  const aiServices = [
    {
      category: 'Image Generation',
      services: [
        { id: 'midjourney', name: 'Midjourney' },
        { id: 'imagefx', name: 'Image FX' },
        { id: 'imagen', name: 'Imagen' },
        { id: 'dalle', name: 'DALL-E 3' },
        { id: 'runway_image', name: 'Runway ML (Image)' }
      ]
    },
    {
      category: 'Video Generation',
      services: [
        { id: 'runway_video', name: 'Runway ML (Video)' },
        { id: 'sora', name: 'Sora' },
        { id: 'pika', name: 'Pika Labs' },
        { id: 'stable_video', name: 'Stable Video' },
        { id: 'gen2', name: 'Gen-2' }
      ]
    }
  ];

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target.result;
      
      if (!validateYaml(content)) {
        setError(getYamlError(content));
        return;
      }

      try {
        const parsedYaml = parseYaml(content);
        setYamlContent(parsedYaml);
        setError(null);

        const response = await fetch('/api/convert', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            yaml: parsedYaml,
            service: service
          }),
        });

        if (!response.ok) {
          throw new Error('サーバーエラーが発生しました');
        }

        const data = await response.json();
        // 最大10個のプロンプトを表示
        setPrompts(Array.isArray(data.prompts) ? data.prompts.slice(0, 10) : [data.prompts]);
      } catch (err) {
        setError(err.message);
      }
    };

    reader.readAsText(file);
  };

  const handlePromptSubmit = async (e) => {
    e.preventDefault();
    if (Object.values(promptElements).every(val => !val.trim())) return;

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          elements: promptElements,
          service: service,
          count: promptCount
        }),
      });

      if (!response.ok) {
        throw new Error('サーバーエラーが発生しました');
      }

      const data = await response.json();
      setPrompts(data.prompts);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleElementChange = (element, value) => {
    setPromptElements(prev => ({
      ...prev,
      [element]: value
    }));
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>AI Prompt Generator</h1>
      </header>

      <main className="App-main">
        <div className="mode-selector">
          <button
            className={`mode-button ${mode === 'convert' ? 'active' : ''}`}
            onClick={() => setMode('convert')}
          >
            YAML
          </button>
          <button
            className={`mode-button ${mode === 'generate' ? 'active' : ''}`}
            onClick={() => setMode('generate')}
          >
            Generate
          </button>
        </div>

        <section className="input-section">
          <div className="service-selector">
           <select
             value={service}
             onChange={(e) => setService(e.target.value)}
             className="service-select"
           >
             <option value="">Select AI Service</option>
             {aiServices.map(category => (
               <optgroup key={category.category} label={category.category}>
                 {category.services.map(s => (
                   <option key={s.id} value={s.id}>{s.name}</option>
                 ))}
               </optgroup>
             ))}
           </select>
         </div>

          {mode === 'convert' ? (
            <div className="file-input-wrapper">
              <input
                type="file"
                accept=".yaml,.yml"
                onChange={handleFileUpload}
                className="file-input"
              />
              <span className="file-input-label">YAML</span>
            </div>
          ) : (
            <form onSubmit={handlePromptSubmit} className="prompt-form">
              <div className="prompt-count-selector">
                <label htmlFor="promptCount">生成するプロンプト数:</label>
                <select
                  id="promptCount"
                  value={promptCount}
                  onChange={(e) => setPromptCount(Number(e.target.value))}
                >
                  {[...Array(10)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
              </div>
              <div className="prompt-elements">
                <div className="element-group">
                  <h4>Basic Elements</h4>
                  <div className="element-input">
                    <label>Subject</label>
                    <input
                      type="text"
                      value={promptElements.subject}
                      onChange={(e) => handleElementChange('subject', e.target.value)}
                      placeholder="e.g., young woman, old clock"
                    />
                  </div>
                  <div className="element-input">
                    <label>Environment</label>
                    <input
                      type="text"
                      value={promptElements.environment}
                      onChange={(e) => handleElementChange('environment', e.target.value)}
                      placeholder="e.g., forest, futuristic city"
                    />
                  </div>
                  <div className="element-input">
                    <label>When</label>
                    <input
                      type="text"
                      value={promptElements.when}
                      onChange={(e) => handleElementChange('when', e.target.value)}
                      placeholder="e.g., sunset, midnight, dawn"
                    />
                  </div>
                  <div className="element-input">
                    <label>Action</label>
                    <input
                      type="text"
                      value={promptElements.action}
                      onChange={(e) => handleElementChange('action', e.target.value)}
                      placeholder="e.g., running, dancing, floating"
                    />
                  </div>
                  <div className="element-input">
                    <label>Mood</label>
                    <input
                      type="text"
                      value={promptElements.mood}
                      onChange={(e) => handleElementChange('mood', e.target.value)}
                      placeholder="e.g., mysterious, cheerful"
                    />
                  </div>
                  <div className="element-input">
                    <label>Style</label>
                    <input
                      type="text"
                      value={promptElements.style}
                      onChange={(e) => handleElementChange('style', e.target.value)}
                      placeholder="e.g., anime, photorealistic"
                    />
                  </div>
                </div>

                <div className="element-group">
                  <h4>Camera Work</h4>
                  <div className="element-input">
                    <label>Camera Angle</label>
                    <select
                      value={promptElements.cameraAngle}
                      onChange={(e) => handleElementChange('cameraAngle', e.target.value)}
                      className="composition-select"
                    >
                      {cameraAngles.map(angle => (
                        <option key={angle.id} value={angle.id}>{angle.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="element-input">
                    <label>Shot Type</label>
                    <select
                      value={promptElements.shotType}
                      onChange={(e) => handleElementChange('shotType', e.target.value)}
                      className="composition-select"
                    >
                      {shotTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="element-input">
                    <label>Perspective</label>
                    <select
                      value={promptElements.perspective}
                      onChange={(e) => handleElementChange('perspective', e.target.value)}
                      className="composition-select"
                    >
                      {perspectives.map(persp => (
                        <option key={persp.id} value={persp.id}>{persp.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="element-group">
                  <h4>Composition</h4>
                  <div className="element-input">
                    <label>Composition Rule</label>
                    <select
                      value={promptElements.compositionRule}
                      onChange={(e) => handleElementChange('compositionRule', e.target.value)}
                      className="composition-select"
                    >
                      {compositionRules.map(rule => (
                        <option key={rule.id} value={rule.id}>{rule.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="element-input">
                    <label>Composition Technique</label>
                    <select
                      value={promptElements.compositionTechnique}
                      onChange={(e) => handleElementChange('compositionTechnique', e.target.value)}
                      className="composition-select"
                    >
                      {compositionTechniques.map(tech => (
                        <option key={tech.id} value={tech.id}>{tech.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="element-group">
                  <h4>Lighting</h4>
                  <div className="element-input">
                    <label>Light Direction</label>
                    <select
                      value={promptElements.lightingDirection}
                      onChange={(e) => handleElementChange('lightingDirection', e.target.value)}
                      className="composition-select"
                    >
                      {lightingDirections.map(dir => (
                        <option key={dir.id} value={dir.id}>{dir.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="element-input">
                    <label>Light Type</label>
                    <select
                      value={promptElements.lightingType}
                      onChange={(e) => handleElementChange('lightingType', e.target.value)}
                      className="composition-select"
                    >
                      {lightingTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="element-group">
                  <h4>Additional Details</h4>
                  <div className="element-input">
                    <label>Details</label>
                    <input
                      type="text"
                      value={promptElements.details}
                      onChange={(e) => handleElementChange('details', e.target.value)}
                      placeholder="e.g., detailed texture, light reflection"
                    />
                  </div>
                  <div className="element-input">
                    <label>Color Palette</label>
                    <input
                      type="text"
                      value={promptElements.colorPalette}
                      onChange={(e) => handleElementChange('colorPalette', e.target.value)}
                      placeholder="e.g., pastel colors, monochrome"
                    />
                  </div>
                </div>
              </div>
              <button type="submit" className="generate-button">
                Generate
              </button>
            </form>
          )}

          {error && <div className="error-message">{error}</div>}
        </section>

        {prompts.length > 0 && (
          <div className="prompts-section">
            {prompts.map((prompt, index) => (
              <div key={index} className="prompt-card">
                <pre>{prompt}</pre>
                <button
                  onClick={() => navigator.clipboard.writeText(prompt)}
                  className="copy-button"
                  title="Copy to clipboard"
                >
                  Copy
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;