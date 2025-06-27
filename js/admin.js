// 記事データを管理するクラス
class ArticleManager {
    constructor() {
        this.articles = this.loadArticles();
        this.categories = this.loadCategories();
        this.initEventListeners();
        this.loadCategories();
        this.displayArticles();
    }

    // LocalStorageから記事を読み込み
    loadArticles() {
        const stored = localStorage.getItem('blogArticles');
        return stored ? JSON.parse(stored) : [];
    }
    
    // カテゴリを読み込み
    loadCategories() {
        const stored = localStorage.getItem('blogCategories');
        const defaultCategories = ['AI技術', '機械学習', 'AWS', 'プログラミング'];
        this.categories = stored ? JSON.parse(stored) : defaultCategories;
        this.updateCategorySelects();
        return this.categories;
    }
    
    // カテゴリを保存
    saveCategories() {
        localStorage.setItem('blogCategories', JSON.stringify(this.categories));
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
        
        document.getElementById('manageCategoriesBtn').addEventListener('click', () => {
            this.showCategoryModal();
        });
        
        document.getElementById('imageUpload').addEventListener('change', (e) => {
            this.handleImageUpload(e);
        });
        
        document.getElementById('statusFilter').addEventListener('change', () => {
            this.displayArticles();
        });
        
        document.getElementById('categoryFilter').addEventListener('change', () => {
            this.displayArticles();
        });
        
        document.getElementById('addCategoryBtn').addEventListener('click', () => {
            this.addCategory();
        });
        
        document.getElementById('closeCategoryModal').addEventListener('click', () => {
            this.hideCategoryModal();
        });
    }

    // 記事を保存
    async saveArticle() {
        const title = document.getElementById('title').value;
        const excerpt = document.getElementById('excerpt').value;
        const category = document.getElementById('category').value;
        const content = document.getElementById('content').value;

        if (!title || !excerpt || !category || !content) {
            alert('すべての項目を入力してください');
            return;
        }

        const imageFile = document.getElementById('imageUpload').files[0];
        const seoTitle = document.getElementById('seoTitle').value;
        const seoDescription = document.getElementById('seoDescription').value;
        const isPublished = document.getElementById('isPublished').checked;
        
        const article = {
            id: Date.now(),
            title,
            excerpt,
            category,
            content,
            date: new Date().toLocaleDateString('ja-JP'),
            slug: this.createSlug(title),
            image: imageFile ? await this.convertImageToBase64(imageFile) : null,
            seoTitle: seoTitle || title,
            seoDescription: seoDescription || excerpt,
            isPublished
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
        const statusFilter = document.getElementById('statusFilter').value;
        const categoryFilter = document.getElementById('categoryFilter').value;
        
        let filteredArticles = this.articles;
        
        if (statusFilter !== 'all') {
            filteredArticles = filteredArticles.filter(article => 
                statusFilter === 'published' ? article.isPublished : !article.isPublished
            );
        }
        
        if (categoryFilter !== 'all') {
            filteredArticles = filteredArticles.filter(article => 
                article.category === categoryFilter
            );
        }
        
        if (filteredArticles.length === 0) {
            container.innerHTML = '<p>該当する記事がありません。</p>';
            return;
        }

        const html = filteredArticles.map(article => `
            <div class="article-item">
                <div class="article-info">
                    <h3>${article.title}</h3>
                    <p>${article.excerpt}</p>
                    <div>
                        <span class="status-badge ${article.isPublished ? 'status-published' : 'status-draft'}">
                            ${article.isPublished ? '公開中' : '下書き'}
                        </span>
                        <small>カテゴリ: ${article.category} | 日付: ${article.date}</small>
                    </div>
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

    // カテゴリ選択ボックスを更新
    updateCategorySelects() {
        const categorySelect = document.getElementById('category');
        const categoryFilter = document.getElementById('categoryFilter');
        
        // 記事作成用セレクト
        categorySelect.innerHTML = '<option value="">選択してください</option>' +
            this.categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
        
        // フィルター用セレクト
        if (categoryFilter) {
            categoryFilter.innerHTML = '<option value="all">すべてのカテゴリ</option>' +
                this.categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
        }
    }
    
    // カテゴリ管理モーダルを表示
    showCategoryModal() {
        document.getElementById('categoryModal').style.display = 'flex';
        this.displayCategoriesList();
    }
    
    // カテゴリ管理モーダルを非表示
    hideCategoryModal() {
        document.getElementById('categoryModal').style.display = 'none';
    }
    
    // カテゴリ一覧を表示
    displayCategoriesList() {
        const container = document.getElementById('categoriesList');
        const html = this.categories.map(category => `
            <div class="category-item">
                <span>${category}</span>
                <button onclick="articleManager.deleteCategory('${category}')" class="delete-btn">削除</button>
            </div>
        `).join('');
        container.innerHTML = html;
    }
    
    // カテゴリを追加
    addCategory() {
        const name = document.getElementById('newCategoryName').value.trim();
        if (name && !this.categories.includes(name)) {
            this.categories.push(name);
            this.saveCategories();
            this.updateCategorySelects();
            this.displayCategoriesList();
            document.getElementById('newCategoryName').value = '';
        }
    }
    
    // カテゴリを削除
    deleteCategory(name) {
        if (confirm(`カテゴリ「${name}」を削除しますか？`)) {
            this.categories = this.categories.filter(cat => cat !== name);
            this.saveCategories();
            this.updateCategorySelects();
            this.displayCategoriesList();
        }
    }
    
    // 画像アップロード処理
    handleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.getElementById('imagePreview');
                preview.innerHTML = `<img src="${e.target.result}" alt="プレビュー">`;
            };
            reader.readAsDataURL(file);
        }
    }
    
    // 画像をBase64に変換
    convertImageToBase64(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(file);
        });
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