#!/bin/bash

# 画像をS3にアップロードするスクリプト
# 使用方法: ./scripts/upload-image.sh path/to/image.png

if [ $# -eq 0 ]; then
    echo "使用方法: $0 <画像ファイルパス>"
    echo "例: $0 ~/Desktop/sample.png"
    exit 1
fi

IMAGE_PATH="$1"
BUCKET_NAME="ai-blog-images-992382791277"
S3_BASE_URL="https://${BUCKET_NAME}.s3.ap-northeast-1.amazonaws.com"

# ファイル名を取得
FILENAME=$(basename "$IMAGE_PATH")

# S3にアップロード
echo "画像をアップロード中: $FILENAME"
aws s3 cp "$IMAGE_PATH" "s3://${BUCKET_NAME}/articles/${FILENAME}"

if [ $? -eq 0 ]; then
    echo "✅ アップロード完了!"
    echo ""
    echo "📋 Markdownで使用するURL:"
    echo "${S3_BASE_URL}/articles/${FILENAME}"
    echo ""
    echo "📝 フロントマターでの使用例:"
    echo "image: \"${S3_BASE_URL}/articles/${FILENAME}\""
    echo ""
    echo "📝 記事内での使用例:"
    echo "![説明文](${S3_BASE_URL}/articles/${FILENAME})"
else
    echo "❌ アップロードに失敗しました"
    exit 1
fi