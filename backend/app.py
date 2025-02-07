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
        print(f"Error in generate_prompt: {str(e)}")  # デバッグ用ログ追加
        import traceback
        print(traceback.format_exc())  # スタックトレース出力
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
        # リクエストの詳細をログ出力
        print("=== Request Details ===")
        print(f"Request Data: {data}")
        print(f"YAML Content: {yaml_content}")
        print(f"Service: {service}")
        
        try:
            # 最適化処理の実行とログ出力
            print("=== Optimization Process ===")
            optimized_prompts = optimize_prompt(yaml_content, service)
            print(f"Optimized Prompts: {optimized_prompts}")
            
            # レスポンスの正規化とログ出力
            print("=== Response Normalization ===")
            if isinstance(optimized_prompts, str):
                optimized_prompts = [optimized_prompts]
            elif not isinstance(optimized_prompts, list):
                optimized_prompts = [str(optimized_prompts)]
            print(f"Normalized Prompts: {optimized_prompts}")
            
            # 最終レスポンスの作成
            response = {'prompts': optimized_prompts[:10]}
            print(f"Final Response: {response}")
            return jsonify(response)
            
        except Exception as e:
            print("\n=== Error Details ===")
            print(f"Error Type: {type(e).__name__}")
            print(f"Error Message: {str(e)}")
            import traceback, sys
            print("\n=== Full Traceback ===")
            traceback.print_exc(file=sys.stdout)
            print("\n=== Environment ===")
            print(f"Python Version: {sys.version}")
            print(f"Environment Variables: {dict(os.environ)}")
            raise
            
    except Exception as e:
        print("\n=== Request Error ===")
        print(f"Error Type: {type(e).__name__}")
        print(f"Error Message: {str(e)}")
        import traceback, sys
        print("\n=== Full Traceback ===")
        traceback.print_exc(file=sys.stdout)
        return jsonify({
            'error': str(e),
            'error_type': type(e).__name__,
            'traceback': traceback.format_exc()
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 8000)))