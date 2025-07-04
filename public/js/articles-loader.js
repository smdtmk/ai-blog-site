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
                        <a href="#" class="read-more" onclick="showArticleModal('${article.slug}')">続きを読む</a>
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

    async showArticleDetail(slug) {
        try {
            const response = await apiConfig.getArticles();
            const articles = response.articles || [];
            const article = articles.find(a => a.slug === slug);
            
            if (!article) {
                alert('記事が見つかりません');
                return;
            }

            // モーダルを作成
            const modal = document.createElement('div');
            modal.className = 'article-modal';
            modal.innerHTML = `
                <div class="modal-overlay" onclick="closeArticleModal()"></div>
                <div class="modal-content">
                    <button class="modal-close" onclick="closeArticleModal()">&times;</button>
                    <div class="article-header">
                        <div class="article-emoji-large">${article.emoji}</div>
                        <h1 class="article-title">${article.title}</h1>
                        <div class="article-meta">
                            <time>${article.date}</time>
                            <div class="article-topics">
                                ${article.topics.map(topic => `<span class="topic-tag">${topic}</span>`).join('')}
                            </div>
                        </div>
                    </div>
                    <div class="article-body">
                        ${marked.parse(article.excerpt.replace('...', '') + '\n\n' + 'この記事の全文を読むには、管理者にお問い合わせください。')}
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            document.body.style.overflow = 'hidden';
            
        } catch (error) {
            console.error('記事詳細の読み込みに失敗:', error);
            alert('記事の読み込みに失敗しました');
        }
    }
}

// グローバル関数
let articlesLoader;
function showArticleModal(slug) {
    if (articlesLoader) {
        articlesLoader.showArticleDetail(slug);
    }
}

function closeArticleModal() {
    const modal = document.querySelector('.article-modal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = 'auto';
    }
}

// ページ読み込み時に実行
document.addEventListener('DOMContentLoaded', () => {
    articlesLoader = new ArticlesLoader();
});