import { useState } from 'react';
import { parseYaml, validateYaml, getYamlError, structurePromptData } from './utils/yamlParser';
import './App.css';

function App() {
  const [mode, setMode] = useState('convert');
  const [yamlContent, setYamlContent] = useState(null);
  const [service, setService] = useState('');
  const [error, setError] = useState(null);
  const [prompts, setPrompts] = useState([]);
  const [projectInfo, setProjectInfo] = useState(null);
  const [promptElements, setPromptElements] = useState({
    subject: '',
    environment: '',
    when: '',
    action: '',
    mood: '',
    style: '',
    details: '',
    colorPalette: '',
    cameraAngle: '',
    shotType: '',
    perspective: '',
    compositionRule: '',
    compositionTechnique: '',
    lightingDirection: '',
    lightingType: ''
  });

  const cameraAngles = [
    { id: '', name: '選択なし' },
    { id: 'eye_level', name: 'Eye Level' },
    { id: 'low_angle', name: 'Low Angle' },
    { id: 'high_angle', name: 'High Angle' },
    { id: 'birds_eye', name: 'Bird\'s Eye View' },
    { id: 'dutch_angle', name: 'Dutch Angle' }
  ];

  const shotTypes = [
    { id: '', name: '選択なし' },
    { id: 'extreme_close_up', name: 'Extreme Close-up' },
    { id: 'close_up', name: 'Close-up' },
    { id: 'medium', name: 'Medium Shot' },
    { id: 'long', name: 'Long Shot' },
    { id: 'extreme_long', name: 'Extreme Long Shot' }
  ];

  const perspectives = [
    { id: '', name: '選択なし' },
    { id: 'one_point', name: 'One-Point Perspective' },
    { id: 'two_point', name: 'Two-Point Perspective' },
    { id: 'three_point', name: 'Three-Point Perspective' }
  ];

  const compositionRules = [
    { id: '', name: '選択なし' },
    { id: 'rule_of_thirds', name: 'Rule of Thirds' },
    { id: 'golden_ratio', name: 'Golden Ratio' },
    { id: 'center', name: 'Central Composition' },
    { id: 'diagonal', name: 'Diagonal Composition' },
    { id: 's_curve', name: 'S-Curve Composition' }
  ];

  const compositionTechniques = [
    { id: '', name: '選択なし' },
    { id: 'leading_lines', name: 'Leading Lines' },
    { id: 'frame_in_frame', name: 'Frame within Frame' },
    { id: 'symmetry', name: 'Symmetry' },
    { id: 'pattern', name: 'Pattern' }
  ];

  const lightingDirections = [
    { id: '', name: '選択なし' },
    { id: 'front', name: 'Front Lighting' },
    { id: 'side', name: 'Side Lighting' },
    { id: 'back', name: 'Back Lighting' },
    { id: 'top', name: 'Top Lighting' },
    { id: 'under', name: 'Under Lighting' }
  ];

  const lightingTypes = [
    { id: '', name: '選択なし' },
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
        const structuredData = structurePromptData(parsedYaml);
        
        setYamlContent(parsedYaml);
        setProjectInfo(structuredData.project);
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
        setPrompts(structuredData.prompts);
      } catch (err) {
        setError(err.message);
      }
    };

    reader.readAsText(file);
  };

  const handlePromptSubmit = async (e) => {
    e.preventDefault();

    try {
      // 空でないプロパティのみを含むオブジェクトを作成
      const nonEmptyElements = Object.fromEntries(
        Object.entries(promptElements).filter(([_, value]) => value.trim() !== '')
      );

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          elements: nonEmptyElements,
          service: service
        }),
      });

      if (!response.ok) {
        throw new Error('サーバーエラーが発生しました');
      }

      const data = await response.json();
      setPrompts([{
        content: data.prompts[0],
        parameters: {},
        metadata: { service }
      }]);
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
        <div className="controls-row">
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
        </div>

        <section className="input-section">

          {mode === 'convert' ? (
            <div className="yaml-input-section">
              <div className="yaml-text-input">
                <textarea
                  value={yamlContent || ''}
                  onChange={async (e) => {
                    const content = e.target.value;
                    setYamlContent(content);
                    
                    if (!validateYaml(content)) {
                      setError(getYamlError(content));
                      return;
                    }

                    try {
                      const parsedYaml = parseYaml(content);
                      const structuredData = structurePromptData(parsedYaml);
                      
                      setProjectInfo(structuredData.project);
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
                      setPrompts(data.prompts.map(prompt => ({
                        content: prompt,
                        parameters: {},
                        metadata: { service }
                      })));
                    } catch (err) {
                      setError(err.message);
                    }
                  }}
                  placeholder="YAMLを入力してください..."
                  className="yaml-textarea"
                />
              </div>
              <button
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.yaml,.yml';
                  input.onchange = handleFileUpload;
                  input.click();
                }}
                className="upload-button"
              >
                ファイルを選択
              </button>
            </div>
          ) : (
            <form onSubmit={handlePromptSubmit} className="prompt-form">
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
                  <h4>Composition & Camera Work</h4>
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
                  <h4>Lighting & Details</h4>
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

        {projectInfo && (
          <div className="project-info">
            <h3>{projectInfo.title}</h3>
            <ul>
              {projectInfo.strategy.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {prompts.length > 0 && (
          <div className="prompts-section">
            {prompts.map((prompt, index) => (
              <div key={index} className="prompt-card">
                <div className="prompt-content">
                  <h4>Prompt {index + 1}</h4>
                  <pre>{prompt.content}</pre>
                  {Object.keys(prompt.parameters).length > 0 && (
                    <div className="prompt-parameters">
                      <h5>Parameters:</h5>
                      <pre>{JSON.stringify(prompt.parameters, null, 2)}</pre>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(
                    prompt.content + ' ' + 
                    Object.entries(prompt.parameters)
                      .map(([key, value]) => `--${key} ${value}`)
                      .join(' ')
                  )}
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