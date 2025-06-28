# AI Blog Site

サーバーレス構成のAIブログ管理システム

## 概要

AIや技術に関する記事を管理・公開するためのブログサイトです。
Zenn風のMarkdownベースの記事管理とAPI Gateway + Lambdaでのサーバーレス構成を採用しています。

## 技術スタック

- **フロントエンド**: HTML, CSS, JavaScript
- **ホスティング**: AWS Amplify
- **API**: API Gateway + Lambda
- **ストレージ**: Amazon S3
- **インフラ**: AWS CDK
- **記事管理**: Markdown + Front Matter

## プロジェクト構造

```
ai-blog-site/
├── infrastructure/     # CDKインフラコード
│   ├── cdk-api-stack.js   # API Gateway + Lambda定義
│   └── cdk-app.js         # CDKアプリケーション
├── public/             # Webコンテンツ
│   ├── css/               # スタイルシート
│   ├── js/                # JavaScript
│   └── *.html             # HTMLページ
└── package.json        # プロジェクト設定
```

## 使用方法

### 管理画面での記事作成

1. `public/admin.html` にアクセス
2. **記事作成タブ**: Markdownで記事を作成
3. **画像アップロードタブ**: ドラッグ&ドロップで画像アップロード
4. **記事一覧タブ**: 保存済み記事の管理

### Markdownフォーマット

```markdown
---
title: "記事タイトル"
emoji: "🤖"
type: "tech"
topics: ["AI", "ChatGPT"]
published: true
date: "2024-12-15"
image: "https://..."
---

# 記事タイトル

記事の内容をここに書きます。
```

## インフラ管理

### CDKデプロイ

```bash
# API Gateway + Lambdaをデプロイ
npm run cdk:deploy

# インフラを削除
npm run cdk:destroy
```

### ローカル開発

```bash
# ローカルサーバーを起動
npm run dev
```

## デプロイ

AWS Amplifyでホスティングされています。GitHubにプッシュすると自動的にデプロイされます。

## APIエンドポイント

- `POST /upload-url` - 画像アップロード用プリサインドURL生成
- `POST /create-folder` - S3フォルダ作成
- `POST /articles` - 記事保存