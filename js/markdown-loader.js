// Markdown記事を読み込み・解析するクラス
class MarkdownLoader {
    constructor() {
        this.articles = [];
        this.loadArticles();
    }

    // 記事一覧を読み込み
    async loadArticles() {
        // 記事ファイル一覧（実際の実装では動的に取得）
        const articleFiles = [
            'chatgpt-guide.md',
            'machine-learning-intro.md',
            'aws-amplify-serverless.md'
        ];

        try {
            for (const file of articleFiles) {
                const article = await this.loadArticle(file);
                if (article && article.frontmatter.published) {
                    this.articles.push(article);
                }
            }
            
            // 日付順でソート
            this.articles.sort((a, b) => new Date(b.frontmatter.date) - new Date(a.frontmatter.date));
            
            this.displayArticles();
            this.updateSidebar();
        } catch (error) {
            console.error('記事の読み込みに失敗しました:', error);
            this.displayFallbackArticles();
        }
    }

    // 個別記事を読み込み
    async loadArticle(filename) {
        try {
            const response = await fetch(`articles/${filename}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const content = await response.text();
            return this.parseMarkdown(content, filename);
        } catch (error) {
            console.error(`記事 ${filename} の読み込みに失敗:`, error);
            return null;
        }
    }

    // Markdownを解析（フロントマター + 本文）
    parseMarkdown(content, filename) {
        const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
        const match = content.match(frontmatterRegex);
        
        if (!match) {
            console.error('フロントマターが見つかりません:', filename);
            return null;
        }

        const frontmatterText = match[1];
        const markdownContent = match[2];

        // フロントマターを解析
        const frontmatter = this.parseFrontmatter(frontmatterText);
        
        // 概要を生成（最初の段落から）
        const excerpt = this.generateExcerpt(markdownContent);

        return {
            filename: filename.replace('.md', ''),
            frontmatter,
            content: markdownContent,
            excerpt,
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
            
            // 引用符を除去
            value = value.replace(/^["']|["']$/g, '');
            
            // 配列の処理
            if (value.startsWith('[') && value.endsWith(']')) {
                value = value.slice(1, -1).split(',').map(item => item.trim().replace(/^["']|["']$/g, ''));
            }
            
            // ブール値の処理
            if (value === 'true') value = true;
            if (value === 'false') value = false;
            
            frontmatter[key] = value;
        }
        
        return frontmatter;
    }

    // 記事の概要を生成
    generateExcerpt(content) {
        // 最初の段落を取得
        const firstParagraph = content.split('\n\n')[1] || content.split('\n')[0];
        return firstParagraph.replace(/[#*`]/g, '').substring(0, 100) + '...';
    }

    // 記事一覧を表示
    displayArticles() {
        const container = document.getElementById('articles');
        if (!container) return;

        const html = this.articles.slice(0, 6).map(article => `
            <article class="article-card">
                <div class="article-image">
                    ${article.frontmatter.image ? 
                        `<img src="${article.frontmatter.image}" alt="${article.frontmatter.title}">` : 
                        `<span class="article-emoji">${article.frontmatter.emoji || '📝'}</span>`
                    }
                </div>
                <div class="article-content">
                    <h2 class="article-title">${article.frontmatter.title}</h2>
                    <p class="article-excerpt">${article.excerpt}</p>
                    <div class="article-meta">
                        <span>${article.frontmatter.date}</span>
                        <a href="#" class="read-more" onclick="markdownLoader.showArticle('${article.filename}')">続きを読む</a>
                    </div>
                    <div class="article-topics">
                        ${(article.frontmatter.topics || []).map(topic => 
                            `<span class="topic-tag">${topic}</span>`
                        ).join('')}
                    </div>
                </div>
            </article>
        `).join('');

        container.innerHTML = html;
    }

    // サイドバーを更新
    updateSidebar() {
        // 人気記事
        const popularList = document.querySelector('.widget ul');
        if (popularList && this.articles.length > 0) {
            const popularHtml = this.articles.slice(0, 4).map(article => 
                `<li><a href="#" onclick="markdownLoader.showArticle('${article.filename}')">${article.frontmatter.title}</a></li>`
            ).join('');
            popularList.innerHTML = popularHtml;
        }

        // トピック別記事数
        const categoryList = document.querySelectorAll('.widget ul')[1];
        if (categoryList) {
            const topics = this.getTopicCounts();
            const topicHtml = Object.entries(topics).map(([topic, count]) => 
                `<li><a href="#">${topic} (${count})</a></li>`
            ).join('');
            categoryList.innerHTML = topicHtml;
        }
    }

    // トピック別記事数を計算
    getTopicCounts() {
        const counts = {};
        this.articles.forEach(article => {
            (article.frontmatter.topics || []).forEach(topic => {
                counts[topic] = (counts[topic] || 0) + 1;
            });
        });
        return counts;
    }

    // 記事詳細を表示
    showArticle(filename) {
        const article = this.articles.find(a => a.filename === filename);
        
        if (article) {
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
                <div class="article-header">
                    <span class="article-emoji-large">${article.frontmatter.emoji || '📝'}</span>
                    <h1>${article.frontmatter.title}</h1>
                    <div class="article-meta-detail">
                        <span>${article.frontmatter.date}</span>
                        <div class="topics">
                            ${(article.frontmatter.topics || []).map(topic => 
                                `<span class="topic-tag">${topic}</span>`
                            ).join('')}
                        </div>
                    </div>
                </div>
                <div class="article-body">${article.html}</div>
            `;
            
            modal.className = 'modal';
            modal.appendChild(content);
            document.body.appendChild(modal);
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            });
        }
    }

    // フォールバック記事表示（読み込み失敗時）
    displayFallbackArticles() {
        const container = document.getElementById('articles');
        if (!container) return;

        container.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #666;">
                <p>記事を読み込み中です...</p>
                <p>しばらくお待ちください。</p>
            </div>
        `;
    }
}

// 初期化
let markdownLoader;
document.addEventListener('DOMContentLoaded', () => {
    markdownLoader = new MarkdownLoader();
});