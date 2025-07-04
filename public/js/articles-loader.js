// 記事読み込み機能
class ArticlesLoader {
    constructor() {
        this.loadArticles();
    }

    async loadArticles() {
        console.log('記事読み込み開始');
        try {
            console.log('API呼び出し中...');
            const response = await apiConfig.getArticles();
            console.log('APIレスポンス:', response);
            
            const articles = response.articles || [];
            console.log('記事数:', articles.length);
            
            this.displayArticles(articles);
        } catch (error) {
            console.error('記事の読み込みに失敗:', error);
            this.displayError();
        }
    }

    displayArticles(articles) {
        const container = document.querySelector('.articles-grid');
        console.log('記事コンテナ:', container);
        
        if (!container) {
            console.error('記事コンテナが見つかりません');
            return;
        }

        if (articles.length === 0) {
            console.log('記事が0件です');
            container.innerHTML = '<p class="no-articles">記事がまだありません。</p>';
            return;
        }

        console.log(`${articles.length}件の記事を表示中`);
        
        const html = articles.map(article => {
            console.log('記事データ:', article);
            return `
                <article class="article-card">
                    <div class="article-emoji">${article.emoji || '📝'}</div>
                    <div class="article-content">
                        <h2 class="article-title">${article.title || 'タイトルなし'}</h2>
                        <p class="article-excerpt">${article.excerpt || '概要なし'}</p>
                        <div class="article-meta">
                            <time class="article-date">${article.date || '日付なし'}</time>
                            <div class="article-topics">
                                ${(article.topics || []).map(topic => `<span class="topic-tag">${topic}</span>`).join('')}
                            </div>
                        </div>
                    </div>
                </article>
            `;
        }).join('');

        console.log('生成されたHTML:', html.substring(0, 200) + '...');
        container.innerHTML = html;
        console.log('記事表示完了');
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