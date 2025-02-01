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
    mood: '',
    style: '',
    details: '',
    colorPalette: ''
  });

  const imageServices = [
    { id: 'midjourney', name: 'Midjourney' },
    { id: 'imagefx', name: 'Image FX' },
    { id: 'imagen', name: 'Imagen' },
    { id: 'dalle', name: 'DALL-E 3' },
    { id: 'runway_image', name: 'Runway ML (画像)' }
  ];

  const videoServices = [
    { id: 'runway_video', name: 'Runway ML (動画)' },
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
              <h3>画像生成AI</h3>
              <div className="service-selector">
                {imageServices.map(s => (
                  <button
                    key={s.id}
                    className={`service-button ${service === s.id ? 'active' : ''}`}
                    onClick={() => setService(s.id)}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="service-category">
              <h3>動画生成AI</h3>
              <div className="service-selector">
                {videoServices.map(s => (
                  <button
                    key={s.id}
                    className={`service-button ${service === s.id ? 'active' : ''}`}
                    onClick={() => setService(s.id)}
                  >
                    {s.name}
                  </button>
                ))}
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
                  <label>主題（人物、ものなど）</label>
                  <input
                    type="text"
                    value={promptElements.subject}
                    onChange={(e) => handleElementChange('subject', e.target.value)}
                    placeholder="例: 若い女性、古い時計"
                  />
                </div>
                <div className="element-input">
                  <label>環境</label>
                  <input
                    type="text"
                    value={promptElements.environment}
                    onChange={(e) => handleElementChange('environment', e.target.value)}
                    placeholder="例: 森の中、未来都市"
                  />
                </div>
                <div className="element-input">
                  <label>雰囲気</label>
                  <input
                    type="text"
                    value={promptElements.mood}
                    onChange={(e) => handleElementChange('mood', e.target.value)}
                    placeholder="例: 神秘的、明るい"
                  />
                </div>
                <div className="element-input">
                  <label>スタイル</label>
                  <input
                    type="text"
                    value={promptElements.style}
                    onChange={(e) => handleElementChange('style', e.target.value)}
                    placeholder="例: アニメ調、写実的"
                  />
                </div>
                <div className="element-input">
                  <label>ディテール</label>
                  <input
                    type="text"
                    value={promptElements.details}
                    onChange={(e) => handleElementChange('details', e.target.value)}
                    placeholder="例: 細かな質感、光の反射"
                  />
                </div>
                <div className="element-input">
                  <label>カラーパレット</label>
                  <input
                    type="text"
                    value={promptElements.colorPalette}
                    onChange={(e) => handleElementChange('colorPalette', e.target.value)}
                    placeholder="例: パステルカラー、モノクロ"
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