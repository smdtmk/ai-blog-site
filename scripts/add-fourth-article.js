const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const s3 = new S3Client({ region: 'ap-northeast-1' });
const BUCKET_NAME = 'ai-blog-images-992382791277';

const newArticle = {
  slug: 'serverless-architecture',
  content: `---
title: "サーバーレスアーキテクチャの実践"
emoji: "⚡"
type: "tech"
topics: ["サーバーレス", "AWS Lambda", "API Gateway"]
published: true
date: "2024-12-22"
---

# サーバーレスアーキテクチャの実践

サーバーレスアーキテクチャは現代のクラウド開発において重要な選択肢です。

## サーバーレスとは

サーバーレスとは、サーバーの管理を意識せずにアプリケーションを構築・実行できるアーキテクチャです。

## 主要なサービス

### AWS Lambda
- イベント駆動型の関数実行
- 自動スケーリング
- 使用した分だけ課金

### API Gateway
- RESTful APIの構築
- 認証・認可機能
- レート制限

### DynamoDB
- NoSQLデータベース
- 高速なパフォーマンス
- 自動スケーリング

## メリット

1. **運用負荷の軽減** - サーバー管理が不要
2. **コスト効率** - 実行時間に応じた課金
3. **高可用性** - AWSが自動で冗長化

## 実装例

\`\`\`javascript
exports.handler = async (event) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda!')
  };
  return response;
};
\`\`\`

サーバーレスアーキテクチャを活用して、効率的なアプリケーションを構築しましょう。`
};

async function uploadNewArticle() {
  console.log('4つ目のサンプル記事をS3にアップロード中...');
  
  try {
    // フォルダ作成
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `articles/${newArticle.slug}/`,
      Body: Buffer.from('')
    }));
    
    // 記事ファイル作成
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `articles/${newArticle.slug}/index.md`,
      Body: Buffer.from(newArticle.content, 'utf8'),
      ContentType: 'text/markdown'
    }));
    
    console.log(`✅ ${newArticle.slug} をアップロードしました`);
    console.log('📝 記事タイトル:', 'サーバーレスアーキテクチャの実践');
    console.log('📅 日付:', '2024-12-22');
    console.log('🏷️ トピック:', 'サーバーレス, AWS Lambda, API Gateway');
    
  } catch (error) {
    console.error(`❌ ${newArticle.slug} のアップロードに失敗:`, error.message);
  }
  
  console.log('\n4つ目のサンプル記事のアップロード完了！');
  console.log('記事一覧APIをテストして表示数の変化を確認してください。');
}

uploadNewArticle();