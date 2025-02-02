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
    composition: 'center',
    colorPalette: ''
  });

  const compositions = [
    { id: 'center', name: 'Center Composition' },
    { id: 'rule_of_thirds', name: 'Rule of Thirds' },
    { id: 'golden_ratio', name: 'Golden Ratio' },
    { id: 'diagonal', name: 'Diagonal' },
    { id: 'symmetrical', name: 'Symmetrical' },
    { id: 'frame_within_frame', name: 'Frame Within Frame' },
    { id: 'leading_lines', name: 'Leading Lines' },
    { id: 'triangular', name: 'Triangular' },
    { id: 'radial', name: 'Radial' },
    { id: 'pattern', name: 'Pattern' }
  ];

  const imageServices = [
    { id: 'midjourney', name: 'Midjourney' },
    { id: 'imagefx', name: 'Image FX' },
    { id: 'imagen', name: 'Imagen' },
    { id: 'dalle', name: 'DALL-E 3' },
    { id: 'runway_image', name: 'Runway ML (Image)' }
  ];

  const videoServices = [
    { id: 'runway_video', name: 'Runway ML (Video)' },
    { id: 'sora', name: 'Sora' },
    { id: 'pika', name: 'Pika Labs' },
    { id: 'stable_video', name: 'Stable Video' },
    { id: 'gen2', name: 'Gen-2' }
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
          <div className="service-categories">
            <div className="service-category">
              <h3>Image Generation</h3>
              <div className="service-selector">
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="service-select"
                >
                  <option value="">Select Image AI</option>
                  {imageServices.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="service-category">
              <h3>Video Generation</h3>
              <div className="service-selector">
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="service-select"
                >
                  <option value="">Select Video AI</option>
                  {videoServices.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
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
                  <label>Composition</label>
                  <select
                    value={promptElements.composition}
                    onChange={(e) => handleElementChange('composition', e.target.value)}
                    className="composition-select"
                  >
                    {compositions.map(comp => (
                      <option key={comp.id} value={comp.id}>{comp.name}</option>
                    ))}
                  </select>
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