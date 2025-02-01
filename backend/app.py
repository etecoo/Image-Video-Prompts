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
        if not data:
            return jsonify({'error': '入力データが必要です'}), 400

        service = data.get('service', 'default')
        count = int(data.get('count', 1))

        # 要素ベースのプロンプト生成
        if 'elements' in data:
            elements_data = {
                'elements': data['elements'],
                'service': service
            }
            variations = generate_variations(elements_data, count)
            return jsonify({'prompts': variations})

        # 従来のYAMLベースのプロンプト生成
        if 'yaml' not in data:
            return jsonify({'error': 'YAMLデータまたは要素データが必要です'}), 400

        yaml_content = data['yaml']
        optimized_prompt = optimize_prompt(yaml_content, service)
        variations = generate_variations(optimized_prompt, count)

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

        # プロンプトの最適化（複数のプロンプトに対応）
        optimized_prompts = optimize_prompt(yaml_content, service)
        
        # 単一のプロンプトの場合はリストに変換
        if isinstance(optimized_prompts, str):
            optimized_prompts = [optimized_prompts]
        
        # 最大10個のプロンプトを返す
        return jsonify({'prompts': optimized_prompts[:10]})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 8000)))