#!/bin/bash

# 画像をS3にアップロードするスクリプト
# 使用方法: ./scripts/upload-image.sh <記事名> <画像ファイルパス>

if [ $# -lt 2 ]; then
    echo "使用方法: $0 <記事名> <画像ファイルパス>"
    echo "例: $0 chatgpt-guide ~/Desktop/workflow.png"
    exit 1
fi

ARTICLE_NAME="$1"
IMAGE_PATH="$2"
BUCKET_NAME="ai-blog-images-992382791277"
S3_BASE_URL="https://${BUCKET_NAME}.s3.ap-northeast-1.amazonaws.com"

# ファイル名を取得
FILENAME=$(basename "$IMAGE_PATH")

# 画像をリサイズ・最適化（ImageMagick使用）
TEMP_DIR="/tmp/blog-images"
mkdir -p "$TEMP_DIR"
OPTIMIZED_PATH="${TEMP_DIR}/${FILENAME}"

echo "🖼️ 画像を最適化中..."

# ImageMagickでリサイズ・最適化
if command -v magick &> /dev/null; then
    magick "$IMAGE_PATH" -resize "1200x800>" -quality 85 -strip "$OPTIMIZED_PATH"
    echo "✅ 画像最適化完了"
else
    echo "⚠️ ImageMagickがインストールされていません。元の画像を使用します。"
    cp "$IMAGE_PATH" "$OPTIMIZED_PATH"
fi

# S3にアップロード
echo "🚀 S3にアップロード中: $FILENAME"
aws s3 cp "$OPTIMIZED_PATH" "s3://${BUCKET_NAME}/articles/${ARTICLE_NAME}/${FILENAME}" --content-type "$(file -b --mime-type "$OPTIMIZED_PATH")"

if [ $? -eq 0 ]; then
    echo "✅ アップロード完了!"
    echo ""
    echo "📋 Markdownで使用するURL:"
    echo "${S3_BASE_URL}/articles/${ARTICLE_NAME}/${FILENAME}"
    echo ""
    echo "📝 フロントマターでの使用例:"
    echo "image: \"${S3_BASE_URL}/articles/${ARTICLE_NAME}/${FILENAME}\""
    echo ""
    echo "📝 記事内での使用例:"
    echo "![説明文](${S3_BASE_URL}/articles/${ARTICLE_NAME}/${FILENAME})"
    
    # 一時ファイルを削除
    rm -f "$OPTIMIZED_PATH"
else
    echo "❌ アップロードに失敗しました"
    rm -f "$OPTIMIZED_PATH"
    exit 1
fi