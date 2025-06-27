// 記事個別ページを生成するクラス
class PageGenerator {
    constructor() {
        this.bucketName = 'ai-blog-images-992382791277';
        this.s3BaseUrl = `https://${this.bucketName}.s3.ap-northeast-1.amazonaws.com`;
    }

    // 記事個別ページを生成
    async generateArticlePage(articleFolder) {
        try {
            const response = await fetch(`articles/${articleFolder}/index.md`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const content = await response.text();
            const article = this.parseMarkdown(content, articleFolder);
            
            if (!article) return;

            const pageHtml = this.createPageHtml(article);
            this.savePage(articleFolder, pageHtml);
            
            return `${articleFolder}.html`;
        } catch (error) {
            console.error(`記事ページ生成に失敗: ${articleFolder}`, error);
            return null;
        }
    }

    // Markdownを解析
    parseMarkdown(content, filename) {
        const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
        const match = content.match(frontmatterRegex);
        
        if (!match) return null;

        const frontmatterText = match[1];
        const markdownContent = match[2];
        const frontmatter = this.parseFrontmatter(frontmatterText);

        return {
            filename,
            frontmatter,
            content: markdownContent,
            html: marked.parse(markdownContent)
        };
    }

    // フロントマターを解析
    parseFrontmatter(text) {
        const frontmatter = {};
        const lines = text.split('\n');
        
        for (const line of lines) {
            const colonIndex = line.indexOf(':');
            if (colonIndex === -1) continue;
            
            const key = line.substring(0, colonIndex).trim();
            let value = line.substring(colonIndex + 1).trim();
            value = value.replace(/^["']|["']$/g, '');
            
            if (value.startsWith('[') && value.endsWith(']')) {
                value = value.slice(1, -1).split(',').map(item => item.trim().replace(/^["']|["']$/g, ''));
            }
            
            if (value === 'true') value = true;
            if (value === 'false') value = false;
            
            frontmatter[key] = value;
        }
        
        return frontmatter;
    }

    // 記事ページのHTMLを作成
    createPageHtml(article) {
        return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${article.frontmatter.title} - AI Blog Site</title>
    <meta name="description" content="${article.frontmatter.seoDescription || article.frontmatter.title}">
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/article.css">
</head>
<body>
    <!-- ヘッダー -->
    <header class="header">
        <div class="header-content">
            <a href="index.html" class="logo">AI Blog Site</a>
            <nav class="nav">
                <ul>
                    <li><a href="index.html">ホーム</a></li>
                    <li><a href="contact.html">お問い合わせ</a></li>
                </ul>
            </nav>
        </div>
    </header>

    <!-- メインコンテンツ -->
    <main class="article-main">
        <article class="article-container">
            <header class="article-header">
                <div class="article-emoji-large">${article.frontmatter.emoji || '📝'}</div>
                <h1 class="article-title">${article.frontmatter.title}</h1>
                <div class="article-meta">
                    <time datetime="${article.frontmatter.date}">${article.frontmatter.date}</time>
                    <div class="article-topics">
                        ${(article.frontmatter.topics || []).map(topic => 
                            `<span class="topic-tag">${topic}</span>`
                        ).join('')}
                    </div>
                </div>
            </header>
            
            <div class="article-content">
                ${article.html}
            </div>
            
            <footer class="article-footer">
                <a href="index.html" class="back-link">← 記事一覧に戻る</a>
            </footer>
        </article>
    </main>

    <!-- フッター -->
    <footer class="footer">
        <p>&copy; 2024 AI Blog Site. All rights reserved.</p>
    </footer>
</body>
</html>`;
    }

    // ページをファイルに保存（実際の実装では動的生成）
    savePage(articleFolder, html) {
        // ブラウザ環境では直接ファイル保存できないため、
        // 実際の実装ではビルドプロセスで生成
        console.log(`Generated page for: ${articleFolder}`);
    }
}

// 記事ページ生成の初期化
const pageGenerator = new PageGenerator();