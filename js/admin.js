// 記事データを管理するクラス
class ArticleManager {
    constructor() {
        this.articles = this.loadArticles();
        this.initEventListeners();
        this.displayArticles();
    }

    // LocalStorageから記事を読み込み
    loadArticles() {
        const stored = localStorage.getItem('blogArticles');
        return stored ? JSON.parse(stored) : [];
    }

    // LocalStorageに記事を保存
    saveArticles() {
        localStorage.setItem('blogArticles', JSON.stringify(this.articles));
    }

    // イベントリスナーの初期化
    initEventListeners() {
        document.getElementById('articleForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveArticle();
        });

        document.getElementById('previewBtn').addEventListener('click', () => {
            this.showPreview();
        });
    }

    // 記事を保存
    saveArticle() {
        const title = document.getElementById('title').value;
        const excerpt = document.getElementById('excerpt').value;
        const category = document.getElementById('category').value;
        const content = document.getElementById('content').value;

        if (!title || !excerpt || !category || !content) {
            alert('すべての項目を入力してください');
            return;
        }

        const article = {
            id: Date.now(),
            title,
            excerpt,
            category,
            content,
            date: new Date().toLocaleDateString('ja-JP'),
            slug: this.createSlug(title)
        };

        this.articles.unshift(article);
        this.saveArticles();
        this.displayArticles();
        this.clearForm();
        this.updateMainSite();

        alert('記事が保存されました！');
    }

    // URLスラッグを作成
    createSlug(title) {
        return title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-');
    }

    // プレビューを表示
    showPreview() {
        const content = document.getElementById('content').value;
        const title = document.getElementById('title').value;
        
        let html = '';
        if (title) {
            html += `<h1>${title}</h1>`;
        }
        if (content) {
            html += marked.parse(content);
        }
        
        document.getElementById('preview').innerHTML = html || 'プレビューがここに表示されます';
    }

    // フォームをクリア
    clearForm() {
        document.getElementById('articleForm').reset();
        document.getElementById('preview').innerHTML = 'プレビューがここに表示されます';
    }

    // 記事一覧を表示
    displayArticles() {
        const container = document.getElementById('articlesList');
        
        if (this.articles.length === 0) {
            container.innerHTML = '<p>まだ記事がありません。</p>';
            return;
        }

        const html = this.articles.map(article => `
            <div class="article-item">
                <div class="article-info">
                    <h3>${article.title}</h3>
                    <p>${article.excerpt}</p>
                    <small>カテゴリ: ${article.category} | 日付: ${article.date}</small>
                </div>
                <div class="article-actions">
                    <button class="edit-btn" onclick="articleManager.editArticle(${article.id})">編集</button>
                    <button class="delete-btn" onclick="articleManager.deleteArticle(${article.id})">削除</button>
                </div>
            </div>
        `).join('');

        container.innerHTML = html;
    }

    // 記事を削除
    deleteArticle(id) {
        if (confirm('この記事を削除しますか？')) {
            this.articles = this.articles.filter(article => article.id !== id);
            this.saveArticles();
            this.displayArticles();
            this.updateMainSite();
            alert('記事が削除されました');
        }
    }

    // 記事を編集
    editArticle(id) {
        const article = this.articles.find(a => a.id === id);
        if (article) {
            document.getElementById('title').value = article.title;
            document.getElementById('excerpt').value = article.excerpt;
            document.getElementById('category').value = article.category;
            document.getElementById('content').value = article.content;
            
            // 編集モードの処理（簡略化）
            const form = document.getElementById('articleForm');
            form.onsubmit = (e) => {
                e.preventDefault();
                this.updateArticle(id);
            };
        }
    }

    // 記事を更新
    updateArticle(id) {
        const index = this.articles.findIndex(a => a.id === id);
        if (index !== -1) {
            this.articles[index] = {
                ...this.articles[index],
                title: document.getElementById('title').value,
                excerpt: document.getElementById('excerpt').value,
                category: document.getElementById('category').value,
                content: document.getElementById('content').value,
                date: new Date().toLocaleDateString('ja-JP')
            };
            
            this.saveArticles();
            this.displayArticles();
            this.clearForm();
            this.updateMainSite();
            
            // フォームを新規作成モードに戻す
            document.getElementById('articleForm').onsubmit = (e) => {
                e.preventDefault();
                this.saveArticle();
            };
            
            alert('記事が更新されました！');
        }
    }

    // メインサイトの記事一覧を更新
    updateMainSite() {
        // 実際の実装では、この部分でindex.htmlの記事一覧を動的に更新
        console.log('メインサイトを更新中...');
    }

    // 記事データをエクスポート（JSON形式）
    exportArticles() {
        const dataStr = JSON.stringify(this.articles, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'articles.json';
        link.click();
    }
}

// 初期化
let articleManager;
document.addEventListener('DOMContentLoaded', () => {
    articleManager = new ArticleManager();
});