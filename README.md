# AI Blog Site

Zenn風のMarkdown記事管理システムを採用したブログサイトです。

## 記事の書き方

### 1. 記事ファイルの作成

`articles/` ディレクトリに `.md` ファイルを作成します。

```
articles/
├── hello-world.md
├── ai-introduction.md
└── aws-guide.md
```

### 2. フロントマターの設定

各記事の先頭に以下の形式でメタデータを記述します：

```markdown
---
title: "記事のタイトル"
emoji: "🤖"
type: "tech"
topics: ["AI", "機械学習", "Python"]
published: true
date: "2024-12-15"
---

# 記事の内容

ここに記事の本文をMarkdownで記述します。
```

### 3. フロントマターの項目

| 項目 | 必須 | 説明 |
|------|------|------|
| `title` | ✅ | 記事のタイトル |
| `emoji` | | 記事を表すemoji（デフォルト: 📝） |
| `type` | | 記事の種類（tech, idea など） |
| `topics` | | 記事のトピック（配列形式） |
| `published` | ✅ | 公開状態（true/false） |
| `date` | ✅ | 公開日（YYYY-MM-DD形式） |
| `image` | | アイキャッチ画像のパス |

### 4. 画像の管理（S3）

#### 画像のアップロード

**方法1: コマンドラインスクリプト**
```bash
# 画像をアップロード（自動最適化付き）
./scripts/upload-image.sh chatgpt-guide ~/Desktop/workflow.png

# アップロード後、URLが表示されます
# https://ai-blog-images-992382791277.s3.ap-northeast-1.amazonaws.com/articles/chatgpt-guide/workflow.png
```

**方法2: 管理画面**
- `admin-image.html` でブラウザからアップロード
- ドラッグ&ドロップ対応
- 自動リサイズ・最適化

#### アイキャッチ画像の設定

フロントマターでS3 URLを指定：
```markdown
---
title: "記事タイトル"
image: "https://ai-blog-images-992382791277.s3.ap-northeast-1.amazonaws.com/articles/chatgpt-guide/sample.png"
---
```

#### 記事内での画像使用

```markdown
![Altテキスト](https://ai-blog-images-992382791277.s3.ap-northeast-1.amazonaws.com/articles/chatgpt-guide/sample.png)

<!-- キャプション付き -->
![Altテキスト](https://ai-blog-images-992382791277.s3.ap-northeast-1.amazonaws.com/articles/chatgpt-guide/sample.png)
*画像の説明文*
```

#### 画像最適化機能

- **自動リサイズ**: 1200x800px以下に自動調整
- **品質最適化**: JPEG品質85%で圧縮
- **メタデータ削除**: EXIF情報を自動削除
- **ファイルサイズ減**: 平均60-80%のサイズ減

#### 手動アップロード

```bash
# AWS CLIで直接アップロード
aws s3 cp image.png s3://ai-blog-images-992382791277/articles/
```

### 5. Markdownの書き方

#### 見出し
```markdown
# 大見出し
## 中見出し
### 小見出し
```

#### コードブロック
```markdown
\```python
def hello_world():
    print("Hello, World!")
\```
```

#### リスト
```markdown
- 項目1
- 項目2
  - サブ項目

1. 番号付きリスト
2. 項目2
```

#### 引用
```markdown
> これは引用文です。
```

## デプロイ方法

1. 記事を作成・編集
2. Gitにコミット・プッシュ
3. AWS Amplifyが自動デプロイ

```bash
git add articles/new-article.md
git commit -m "Add new article: タイトル"
git push origin main
```

## ディレクトリ構造

```
├── articles/                    # 記事フォルダ
│   ├── chatgpt-guide/           # 記事ごとのフォルダ
│   │   └── index.md         # 記事ファイル
│   ├── machine-learning-intro/
│   │   └── index.md
│   └── aws-amplify-serverless/
│       └── index.md
├── scripts/                 # ユーティリティスクリプト
│   └── upload-image.sh      # 画像アップロード
├── css/                     # スタイルシート
├── js/                      # JavaScript
├── index.html               # トップページ
├── contact.html             # お問い合わせ
├── admin-image.html         # 画像管理画面
└── README.md                # このファイル

# S3構造
ai-blog-images-992382791277/
└── articles/
    ├── chatgpt-guide/
    │   └── workflow.svg
    ├── machine-learning-intro/
    │   └── algorithm.svg
    └── aws-amplify-serverless/
```

## 管理画面について

従来の管理画面（admin.html）は廃止され、すべての記事管理はGit + Markdownで行います。

## 開発者向け

### ローカル開発

```bash
# 静的サーバーを起動（例：Python）
python -m http.server 8000

# または Node.js
npx serve .
```

### 記事の追加手順

1. `articles/` に新しい `.md` ファイルを作成
2. フロントマターを設定
3. Markdownで記事を執筆
4. `published: true` で公開
5. Git にコミット・プッシュ

これでZenn風の記事管理システムが完成です！