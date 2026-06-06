import os
import sys
import argparse
from pathlib import Path

try:
    import potrace
    import cv2
    import numpy as np
except ImportError:
    print("缺少必要的依赖库。请先安装：")
    print("pip install pypotrace opencv-python numpy")
    sys.exit(1)

def png_to_svg(input_path, output_path):
    """
    将单个 PNG 图片转换为 SVG 矢量图
    """
    # 1. 使用 OpenCV 读取图片（包含透明通道）
    img = cv2.imread(str(input_path), cv2.IMREAD_UNCHANGED)
    if img is None:
        print(f"无法读取图片: {input_path}")
        return False

    # 2. 提取 Alpha 通道或转换为灰度图
    if len(img.shape) == 3 and img.shape[2] == 4:
        # 如果有透明通道，使用透明通道作为掩码
        alpha = img[:, :, 3]
        _, binary = cv2.threshold(alpha, 127, 255, cv2.THRESH_BINARY)
    else:
        # 如果没有透明通道，转换为灰度图并二值化
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        # 使用 Otsu 算法自动计算阈值
        _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

    # 3. 确保数据类型为 bool 或 uint8，potrace 需要二维数组
    # potrace 期望前景为 True (非零)，背景为 False (零)
    bitmap = binary > 0

    # 4. 使用 potrace 追踪位图
    bmp = potrace.Bitmap(bitmap)
    path = bmp.trace()

    # 5. 生成 SVG 内容
    svg_content = []
    svg_content.append(f'<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="{img.shape[1]}" height="{img.shape[0]}" viewBox="0 0 {img.shape[1]} {img.shape[0]}">')
    
    # 遍历所有路径
    for curve in path:
        svg_content.append('<path d="')
        start = curve.start_point
        svg_content.append(f'M {start.x},{start.y} ')
        
        for segment in curve:
            if segment.is_corner:
                c = segment.c
                end = segment.end_point
                svg_content.append(f'L {c.x},{c.y} L {end.x},{end.y} ')
            else:
                c1 = segment.c1
                c2 = segment.c2
                end = segment.end_point
                svg_content.append(f'C {c1.x},{c1.y} {c2.x},{c2.y} {end.x},{end.y} ')
                
        svg_content.append('Z" fill="black" stroke="none" />')
        
    svg_content.append('</svg>')

    # 6. 写入文件
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(svg_content))
        
    return True

def batch_convert(input_dir, output_dir=None):
    """
    批量转换目录下的所有 PNG 文件
    """
    input_path = Path(input_dir)
    if not input_path.is_dir():
        print(f"错误: 输入目录 '{input_dir}' 不存在")
        return

    if output_dir is None:
        output_path = input_path / "svg_output"
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
        
        if png_to_svg(png_file, svg_file):
            success_count += 1

    print(f"\n转换完成! 成功: {success_count}/{len(png_files)}")
    print(f"输出目录: {output_path.absolute()}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="批量将 PNG 图片转换为 SVG 矢量图")
    parser.add_argument("input_dir", help="包含 PNG 文件的输入目录路径")
    parser.add_argument("-o", "--output_dir", help="输出 SVG 文件的目录路径 (默认: 输入目录下的 svg_output 文件夹)", default=None)
    
    args = parser.parse_args()
    batch_convert(args.input_dir, args.output_dir)