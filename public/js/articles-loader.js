// 記事読み込み機能
class ArticlesLoader {
    constructor() {
        this.loadArticles();
    }

    async loadArticles() {
        try {
            const response = await apiConfig.getArticles();
            const articles = response.articles || [];
            this.displayArticles(articles);
        } catch (error) {
            console.error('記事の読み込みに失敗:', error);
            this.displayError();
        }
    }

    displayArticles(articles) {
        const container = document.querySelector('.articles-grid');
        if (!container) return;

        if (articles.length === 0) {
            container.innerHTML = '<p class="no-articles">記事がまだありません。</p>';
            return;
        }

        const html = articles.map(article => `
            <article class="article-card">
                <div class="article-emoji">${article.emoji}</div>
                <div class="article-content">
                    <h2 class="article-title">${article.title}</h2>
                    <p class="article-excerpt">${article.excerpt}</p>
                    <div class="article-meta">
                        <time class="article-date">${article.date}</time>
                        <a href="#" class="read-more" onclick="showArticlePage('${article.slug}')">続きを読む</a>
                    </div>
                    <div class="article-topics">
                        ${article.topics.map(topic => `<span class="topic-tag">${topic}</span>`).join('')}
                    </div>
                </div>
            </article>
        `).join('');

        container.innerHTML = html;
    }

    displayError() {
        const container = document.querySelector('.articles-grid');
        if (!container) return;
        
        container.innerHTML = '<p class="error-message">記事の読み込みに失敗しました。</p>';
    }

    async showArticlePage(slug) {
        try {
            const response = await apiConfig.getArticles();
            const articles = response.articles || [];
            const article = articles.find(a => a.slug === slug);
            
            if (!article) {
                alert('記事が見つかりません');
                return;
            }

            // 新しいページを動的に生成
            const articleHtml = `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${article.title} - AI Blog Site</title>
    <meta name="description" content="${article.excerpt}">
    <link rel="stylesheet" href="/css/style.css">
    <link rel="stylesheet" href="/css/article.css">
</head>
<body>
    <header class="header">
        <div class="header-content">
            <a href="/" class="logo">AI Blog Site</a>
            <nav class="nav">
                <ul>
                    <li><a href="/">ホーム</a></li>
                    <li><a href="/contact.html">お問い合わせ</a></li>
                </ul>
            </nav>
        </div>
    </header>

    <main class="article-main">
        <article class="article-container">
            <header class="article-header">
                <div class="article-emoji-large">${article.emoji}</div>
                <h1 class="article-title">${article.title}</h1>
                <div class="article-meta">
                    <time datetime="${article.date}">${article.date}</time>
                    <div class="article-topics">
                        ${article.topics.map(topic => `<span class="topic-tag">${topic}</span>`).join('')}
                    </div>
                </div>
            </header>
            
            <div class="article-content">
                ${marked.parse(article.excerpt.replace('...', '') + '\n\nこの記事の全文を読むには、管理者にお問い合わせください。')}
            </div>
            
            <footer class="article-footer">
                <a href="/" class="back-link">← 記事一覧に戻る</a>
            </footer>
        </article>
    </main>

    <footer class="footer">
        <p>&copy; 2024 AI Blog Site. All rights reserved.</p>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
</body>
</html>
            `;
            
            // 新しいウィンドウで開くのではなく、現在のページを置き換え
            document.open();
            document.write(articleHtml);
            document.close();
            
        } catch (error) {
            console.error('記事詳細の読み込みに失敗:', error);
            alert('記事の読み込みに失敗しました');
        }
    }
}

// グローバル関数
let articlesLoader;
function showArticlePage(slug) {
    if (articlesLoader) {
        articlesLoader.showArticlePage(slug);
    }
}

// ページ読み込み時に実行
document.addEventListener('DOMContentLoaded', () => {
    articlesLoader = new ArticlesLoader();
});