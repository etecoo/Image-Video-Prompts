import os
import yaml
from prompt_utils import optimize_prompt

def test_yaml_file(file_path):
    print(f"\n=== テスト: {os.path.basename(file_path)} ===")
    try:
        # YAMLファイルを読み込む
        with open(file_path, 'r', encoding='utf-8') as f:
            yaml_content = f.read()
            print("YAMLファイルを読み込みました")

        # プロンプトを最適化
        result = optimize_prompt(yaml_content)
        
        print(f"\n抽出されたプロンプト数: {len(result)}")
        for i, prompt in enumerate(result, 1):
            print(f"\n[プロンプト {i}]")
            print(prompt)
        
        return True
    except Exception as e:
        print(f"エラー: {str(e)}")
        return False

def main():
    yaml_dir = "/Users/ete/Projects/prismancer/YAML"
    test_files = [
        "錯覚と知覚の限界を探求.yml",
        "南極の古代地底王国.yaml",
        "夢と現実の境界を探求する幻想的な視覚シリーズ.yaml"
    ]

    success_count = 0
    for file_name in test_files:
        file_path = os.path.join(yaml_dir, file_name)
        if test_yaml_file(file_path):
            success_count += 1

    print(f"\n=== テスト完了 ===")
    print(f"成功: {success_count}/{len(test_files)} ファイル")

if __name__ == "__main__":
    main()