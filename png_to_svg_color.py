import os
import sys
import argparse
from pathlib import Path
import base64

try:
    from PIL import Image
except ImportError:
    print("缺少必要的依赖库。请先安装：")
    print("pip install Pillow")
    sys.exit(1)

def png_to_svg_color(input_path, output_path):
    """
    将 PNG 图片转换为保留色彩的 SVG
    原理：将 PNG 图片进行 Base64 编码，然后嵌入到 SVG 的 <image> 标签中。
    这是在 SVG 中完美保留复杂色彩和透明度的最可靠方法。
    """
    try:
        # 1. 读取图片获取尺寸
        with Image.open(input_path) as img:
            width, height = img.size
            
        # 2. 读取原始文件并进行 Base64 编码
        with open(input_path, "rb") as image_file:
            encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
            
        # 3. 构建 SVG 内容
        # 使用 data URI scheme 嵌入图片
        data_uri = f"data:image/png;base64,{encoded_string}"
        
        svg_content = f'''<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="{width}" height="{height}" viewBox="0 0 {width} {height}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <image href="{data_uri}" x="0" y="0" width="{width}" height="{height}" />
</svg>'''

        # 4. 写入文件
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(svg_content)
            
        return True
        
    except Exception as e:
        print(f"转换失败 {input_path}: {str(e)}")
        return False

def batch_convert(input_dir, output_dir=None):
    """
    批量转换目录下的所有 PNG 文件
    """
    input_path = Path(input_dir)
    if not input_path.is_dir():
        print(f"错误: 输入目录 '{input_dir}' 不存在")
        return

    if output_dir is None:
        output_path = input_path / "svg_color_output"
    else:
        output_path = Path(output_dir)

    # 创建输出目录
    output_path.mkdir(parents=True, exist_ok=True)

    # 查找所有 png 文件
    png_files = list(input_path.glob("*.png"))
    if not png_files:
        print(f"在 '{input_dir}' 中没有找到 PNG 文件")
        return

    print(f"找到 {len(png_files)} 个 PNG 文件，开始转换...")
    
    success_count = 0
    for i, png_file in enumerate(png_files, 1):
        svg_file = output_path / f"{png_file.stem}.svg"
        print(f"[{i}/{len(png_files)}] 正在转换: {png_file.name} -> {svg_file.name}")
        
        if png_to_svg_color(png_file, svg_file):
            success_count += 1

    print(f"\n转换完成! 成功: {success_count}/{len(png_files)}")
    print(f"输出目录: {output_path.absolute()}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="批量将 PNG 图片转换为保留色彩的 SVG")
    parser.add_argument("input_dir", help="包含 PNG 文件的输入目录路径")
    parser.add_argument("-o", "--output_dir", help="输出 SVG 文件的目录路径 (默认: 输入目录下的 svg_color_output 文件夹)", default=None)
    
    args = parser.parse_args()
    batch_convert(args.input_dir, args.output_dir)