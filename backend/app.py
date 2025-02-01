from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from prompt_utils import load_yaml_content, optimize_prompt, generate_variations
import os

app = Flask(__name__, static_folder='../frontend/build')
CORS(app)

# フロントエンドのルートパスへのルーティング
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/generate', methods=['POST'])
def generate_prompt():
    try:
        data = request.get_json()
        if not data or 'yaml' not in data:
            return jsonify({'error': 'YAMLデータが必要です'}), 400

        yaml_content = data['yaml']
        service = data.get('service', 'default')
        num_variations = data.get('num_variations', 1)

        # プロンプトの最適化
        optimized_prompt = optimize_prompt(yaml_content, service)
        
        # バリエーションの生成
        variations = generate_variations(optimized_prompt, num_variations)

        return jsonify({'prompts': variations})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/convert', methods=['POST'])
def convert_prompt():
    try:
        data = request.get_json()
        if not data or 'yaml' not in data:
            return jsonify({'error': 'YAMLデータが必要です'}), 400

        yaml_content = data['yaml']
        service = data.get('service', 'default')

        # プロンプトの最適化
        optimized_prompt = optimize_prompt(yaml_content, service)

        return jsonify({'prompts': [optimized_prompt]})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 8000)))