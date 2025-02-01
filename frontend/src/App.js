import { useState } from 'react';
import { parseYaml, validateYaml, getYamlError } from './utils/yamlParser';
import './App.css';

function App() {
  const [mode, setMode] = useState('convert'); // 'convert' or 'generate'
  const [yamlContent, setYamlContent] = useState(null);
  const [promptInput, setPromptInput] = useState('');
  const [service, setService] = useState('midjourney');
  const [error, setError] = useState(null);
  const [prompts, setPrompts] = useState([]);

  const services = [
    { id: 'midjourney', name: 'Midjourney' },
    { id: 'imagefx', name: 'Image FX' },
    { id: 'imagen', name: 'Imagen' },
    { id: 'dalle', name: 'DALL-E 3' },
    { id: 'runway', name: 'Runway ML' },
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
        setPrompts(data.prompts);
      } catch (err) {
        setError(err.message);
      }
    };

    reader.readAsText(file);
  };

  const handlePromptSubmit = async (e) => {
    e.preventDefault();
    if (!promptInput.trim()) return;

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          yaml: { prompt: promptInput },
          service: service
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
            {services.map(s => (
              <button
                key={s.id}
                className={`service-button ${service === s.id ? 'active' : ''}`}
                onClick={() => setService(s.id)}
              >
                {s.name}
              </button>
            ))}
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
            <form onSubmit={handlePromptSubmit}>
              <textarea
                className="prompt-input"
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="プロンプトを入力..."
              />
              <button type="submit" className="copy-button">
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