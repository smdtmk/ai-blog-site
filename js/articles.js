// 記事表示用JavaScript
class ArticleDisplay {
    constructor() {
        this.loadAndDisplayArticles();
    }

    // 記事を読み込んで表示
    loadAndDisplayArticles() {
        const articles = this.getArticles();
        this.displayArticles(articles);
        this.updateSidebar(articles);
    }

    // LocalStorageから記事を取得
    getArticles() {
        const stored = localStorage.getItem('blogArticles');
        return stored ? JSON.parse(stored) : this.getDefaultArticles();
    }

    // デフォルト記事（初期表示用）
    getDefaultArticles() {
        return [
            {
                id: 1,
                title: "ChatGPTの活用方法：業務効率化のための実践ガイド",
                excerpt: "ChatGPTを使って日常業務を効率化する具体的な方法を紹介。プロンプトエンジニアリングの基本から応用まで...",
                category: "AI技術",
                date: "2024年12月15日",
                content: "# ChatGPTの活用方法\n\n業務効率化のための実践的なガイドです。"
            },
            {
                id: 2,
                title: "機械学習入門：初心者でも分かるアルゴリズムの基礎",
                excerpt: "機械学習の基本概念から実装まで、初心者向けに分かりやすく解説。Pythonを使った実践例も含めて...",
                category: "機械学習",
                date: "2024年12月12日",
                content: "# 機械学習入門\n\n初心者向けの機械学習ガイドです。"
            },
            {
                id: 3,
                title: "AWS Amplifyで始めるサーバーレス開発",
                excerpt: "AWS Amplifyを使ったモダンなWebアプリケーション開発の手法を解説。インフラエンジニア向けの実践的な内容...",
                category: "AWS",
                date: "2024年12月10日",
                content: "# AWS Amplify開発\n\nサーバーレス開発の実践ガイドです。"
            }
        ];
    }

    // 記事一覧を表示
    displayArticles(articles) {
        const container = document.getElementById('articles');
        if (!container) return;

        const html = articles.slice(0, 6).map(article => `
            <article class="article-card">
                <div class="article-image">画像プレースホルダー</div>
                <div class="article-content">
                    <h2 class="article-title">${article.title}</h2>
                    <p class="article-excerpt">${article.excerpt}</p>
                    <div class="article-meta">
                        <span>${article.date}</span>
                        <a href="#" class="read-more" onclick="articleDisplay.showArticle(${article.id})">続きを読む</a>
                    </div>
                </div>
            </article>
        `).join('');

        container.innerHTML = html;
    }

    // サイドバーを更新
    updateSidebar(articles) {
        // 人気記事（最新3件）
        const popularList = document.querySelector('.widget ul');
        if (popularList && articles.length > 0) {
            const popularHtml = articles.slice(0, 4).map(article => 
                `<li><a href="#" onclick="articleDisplay.showArticle(${article.id})">${article.title}</a></li>`
            ).join('');
            popularList.innerHTML = popularHtml;
        }

        // カテゴリ別記事数を更新
        const categoryList = document.querySelectorAll('.widget ul')[1];
        if (categoryList) {
            const categories = this.getCategoryCounts(articles);
            const categoryHtml = Object.entries(categories).map(([category, count]) => 
                `<li><a href="#">${category} (${count})</a></li>`
            ).join('');
            categoryList.innerHTML = categoryHtml;
        }
    }

    // カテゴリ別記事数を計算
    getCategoryCounts(articles) {
        const counts = {};
        articles.forEach(article => {
            counts[article.category] = (counts[article.category] || 0) + 1;
        });
        return counts;
    }

    // 記事詳細を表示（モーダル風）
    showArticle(id) {
        const articles = this.getArticles();
        const article = articles.find(a => a.id === id);
        
        if (article) {
            // 簡単なモーダル表示
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.8);
                z-index: 1000;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 2rem;
            `;
            
            const content = document.createElement('div');
            content.style.cssText = `
                background: white;
                max-width: 800px;
                max-height: 80vh;
                overflow-y: auto;
                padding: 2rem;
                border-radius: 12px;
                position: relative;
            `;
            
            content.innerHTML = `
                <button onclick="this.closest('.modal').remove()" style="
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                ">×</button>
                <h1>${article.title}</h1>
                <p style="color: #666; margin-bottom: 2rem;">${article.date} | ${article.category}</p>
                <div>${marked.parse(article.content)}</div>
            `;
            
            modal.className = 'modal';
            modal.appendChild(content);
            document.body.appendChild(modal);
            
            // 背景クリックで閉じる
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            });
        }
    }
}

// 初期化
let articleDisplay;
document.addEventListener('DOMContentLoaded', () => {
    articleDisplay = new ArticleDisplay();
});