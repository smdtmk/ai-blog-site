const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const s3 = new S3Client({ region: 'ap-northeast-1' });
const BUCKET_NAME = 'ai-blog-images-992382791277';

const sampleArticles = [
  {
    slug: 'ai-introduction',
    content: `---
title: "AI技術入門"
emoji: "🤖"
type: "tech"
topics: ["AI", "機械学習"]
published: true
date: "2024-12-20"
---

# AI技術入門

人工知能（AI）は現代のテクノロジーの中核を成す技術です。

## AIとは何か

AIは人間の知能を模倣するコンピューターシステムです。

## 主な応用分野

- 自然言語処理
- 画像認識
- 音声認識
- 予測分析

AIの発展により、私たちの生活はより便利になっています。`
  },
  {
    slug: 'web-development-trends',
    content: `---
title: "2024年のWeb開発トレンド"
emoji: "💻"
type: "tech"
topics: ["Web開発", "JavaScript", "React"]
published: true
date: "2024-12-18"
---

# 2024年のWeb開発トレンド

Web開発の世界は常に進化しています。

## 注目の技術

### フロントエンド
- React 18の新機能
- Next.js 14
- TypeScript普及

### バックエンド
- サーバーレス技術
- マイクロサービス
- GraphQL

これらの技術を活用して、より良いWebアプリケーションを構築しましょう。`
  },
  {
    slug: 'cloud-computing-basics',
    content: `---
title: "クラウドコンピューティング基礎"
emoji: "☁️"
type: "tech"
topics: ["AWS", "クラウド", "インフラ"]
published: true
date: "2024-12-15"
---

# クラウドコンピューティング基礎

クラウドコンピューティングは現代のITインフラの基盤です。

## クラウドの利点

1. **スケーラビリティ** - 需要に応じてリソースを調整
2. **コスト効率** - 使用した分だけ支払い
3. **可用性** - 高い稼働率を実現

## 主要なクラウドプロバイダー

- Amazon Web Services (AWS)
- Microsoft Azure
- Google Cloud Platform

クラウドを活用して、効率的なシステムを構築しましょう。`
  }
];

async function uploadSampleArticles() {
  console.log('サンプル記事をS3にアップロード中...');
  
  for (const article of sampleArticles) {
    try {
      // フォルダ作成
      await s3.send(new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: `articles/${article.slug}/`,
        Body: Buffer.from('')
      }));
      
      // 記事ファイル作成
      await s3.send(new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: `articles/${article.slug}/index.md`,
        Body: Buffer.from(article.content, 'utf8'),
        ContentType: 'text/markdown'
      }));
      
      console.log(`✅ ${article.slug} をアップロードしました`);
    } catch (error) {
      console.error(`❌ ${article.slug} のアップロードに失敗:`, error.message);
    }
  }
  
  console.log('サンプル記事のアップロード完了！');
}

uploadSampleArticles();