import { useState } from 'react';
import { parseYaml, validateYaml, getYamlError } from './utils/yamlParser';
import './App.css';

function App() {
  const [yamlContent, setYamlContent] = useState(null);
  const [error, setError] = useState(null);
  const [prompts, setPrompts] = useState([]);

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

        // バックエンドにYAMLデータを送信
        const response = await fetch('/api/convert', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ yaml: parsedYaml }),
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

  return (
    <div className="App">
      <header className="App-header">
        <h1>プロンプト生成・変換サービス</h1>
      </header>

      <main className="App-main">
        <section className="upload-section">
          <h2>YAMLファイルをアップロード</h2>
          <input
            type="file"
            accept=".yaml,.yml"
            onChange={handleFileUpload}
            className="file-input"
          />
          {error && <div className="error-message">{error}</div>}
        </section>

        {prompts.length > 0 && (
          <section className="prompts-section">
            <h2>生成されたプロンプト</h2>
            <div className="prompts-grid">
              {prompts.map((prompt, index) => (
                <div key={index} className="prompt-card">
                  <h3>プロンプト {index + 1}</h3>
                  <pre>{prompt}</pre>
                  <button
                    onClick={() => navigator.clipboard.writeText(prompt)}
                    className="copy-button"
                  >
                    コピー
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;