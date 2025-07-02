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
                        <div class="article-topics">
                            ${article.topics.map(topic => `<span class="topic-tag">${topic}</span>`).join('')}
                        </div>
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
}

// ページ読み込み時に実行
document.addEventListener('DOMContentLoaded', () => {
    new ArticlesLoader();
});