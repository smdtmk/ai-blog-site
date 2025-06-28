class UnifiedAdmin {
    constructor() {
        this.bucketName = 'ai-blog-images-992382791277';
        this.s3BaseUrl = `https://${this.bucketName}.s3.ap-northeast-1.amazonaws.com`;
        this.articles = this.loadArticles();
        this.uploadedImages = this.loadUploadedImages();
        this.selectedFiles = [];
        
        this.initEventListeners();
        this.initDateField();
        this.loadArticleOptions();
        this.displayArticles();
    }

    initEventListeners() {
        // タブ切り替え
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // 記事フォーム
        document.getElementById('articleForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveArticle();
        });

        document.getElementById('previewBtn').addEventListener('click', () => {
            this.showPreview();
        });

        // フォルダ選択ラジオボタン
        document.querySelectorAll('input[name="folderType"]').forEach(radio => {
            radio.addEventListener('change', () => this.toggleFolderSelection());
        });

        // 新しい記事名のバリデーション
        document.getElementById('newArticleName').addEventListener('input', (e) => {
            this.validateArticleName(e.target);
        });



        // 画像アップロードフォーム
        document.getElementById('imageUploadForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleImageUpload();
        });

        // ドラッグ&ドロップ
        const dropZone = document.getElementById('fileDropZone');
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('dragover');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            this.handleFileSelect(e.dataTransfer.files);
        });

        document.getElementById('imageFile').addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files);
        });


    }

    initDateField() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('date').value = today;
    }

    switchTab(tabName) {
        // タブボタンの切り替え
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // タブコンテンツの切り替え
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
            content.style.display = 'none';
        });
        const activeTab = document.getElementById(`${tabName}-tab`);
        if (activeTab) {
            activeTab.classList.add('active');
            activeTab.style.display = 'block';
        }
    }

    loadArticles() {
        const stored = localStorage.getItem('blogArticles');
        return stored ? JSON.parse(stored) : [];
    }

    saveArticles() {
        localStorage.setItem('blogArticles', JSON.stringify(this.articles));
    }

    loadUploadedImages() {
        const stored = localStorage.getItem('uploadedImages');
        return stored ? JSON.parse(stored) : [];
    }

    saveUploadedImages() {
        localStorage.setItem('uploadedImages', JSON.stringify(this.uploadedImages));
    }

    loadArticleOptions() {
        const articleSelect = document.getElementById('articleSelect');
        
        // 既存記事のフォルダ名を取得
        const articleFolders = ['chatgpt-guide', 'machine-learning-intro', 'aws-amplify-serverless'];
        
        articleFolders.forEach(folder => {
            this.addArticleOption(folder);
        });
    }

    addArticleOption(folder) {
        const articleSelect = document.getElementById('articleSelect');
        
        // 重複チェック
        const existingOption = Array.from(articleSelect.options).find(option => option.value === folder);
        if (existingOption) return;
        
        const option = document.createElement('option');
        option.value = folder;
        option.textContent = folder;
        articleSelect.appendChild(option);
    }

    async saveArticle() {
        const title = document.getElementById('title').value;
        const emoji = document.getElementById('emoji').value;
        const excerpt = document.getElementById('excerpt').value;
        const topics = document.getElementById('topics').value.split(',').map(t => t.trim()).filter(t => t);
        const date = document.getElementById('date').value;
        const imageUrl = document.getElementById('imageUrl').value;
        const content = document.getElementById('content').value;
        const isPublished = document.getElementById('isPublished').checked;

        if (!title || !excerpt || !content) {
            alert('必須項目を入力してください');
            return;
        }

        const slug = this.createSlug(title);
        
        const article = {
            id: Date.now(),
            title,
            emoji: emoji || '📝',
            excerpt,
            topics,
            date,
            image: imageUrl,
            content,
            isPublished,
            slug
        };

        // 記事フォルダとファイルを生成
        const markdownContent = this.generateMarkdownFile(article);
        const htmlContent = this.generateHtmlFile(article);

        // 実際の実装では、ここでファイルを生成・保存
        console.log('Generated files:', { slug, markdownContent, htmlContent });

        this.articles.unshift(article);
        this.saveArticles();
        this.displayArticles();
        this.clearForm();

        alert('記事が保存されました！');
    }

    createSlug(title) {
        return title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-');
    }

    generateMarkdownFile(article) {
        return `---
title: "${article.title}"
emoji: "${article.emoji}"
type: "tech"
topics: [${article.topics.map(t => `"${t}"`).join(', ')}]
published: ${article.isPublished}
date: "${article.date}"${article.image ? `\nimage: "${article.image}"` : ''}
---

${article.content}`;
    }

    generateHtmlFile(article) {
        return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${article.title} - AI Blog Site</title>
    <meta name="description" content="${article.excerpt}">
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/article.css">
</head>
<body>
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
                ${marked.parse(article.content)}
            </div>
            
            <footer class="article-footer">
                <a href="index.html" class="back-link">← 記事一覧に戻る</a>
            </footer>
        </article>
    </main>

    <footer class="footer">
        <p>&copy; 2024 AI Blog Site. All rights reserved.</p>
    </footer>
</body>
</html>`;
    }

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

    clearForm() {
        document.getElementById('articleForm').reset();
        document.getElementById('preview').innerHTML = 'プレビューがここに表示されます';
        document.getElementById('imagePreview').innerHTML = '';
        this.initDateField();
    }

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
                    <div>
                        <span class="status-badge ${article.isPublished ? 'status-published' : 'status-draft'}">
                            ${article.isPublished ? '公開中' : '下書き'}
                        </span>
                        <small>日付: ${article.date}</small>
                    </div>
                </div>
                <div class="article-actions">
                    <button class="edit-btn" onclick="unifiedAdmin.editArticle(${article.id})">編集</button>
                    <button class="delete-btn" onclick="unifiedAdmin.deleteArticle(${article.id})">削除</button>
                </div>
            </div>
        `).join('');

        container.innerHTML = html;
    }

    editArticle(id) {
        const article = this.articles.find(a => a.id === id);
        if (article) {
            document.getElementById('title').value = article.title;
            document.getElementById('emoji').value = article.emoji;
            document.getElementById('excerpt').value = article.excerpt;
            document.getElementById('topics').value = article.topics.join(', ');
            document.getElementById('date').value = article.date;
            document.getElementById('imageUrl').value = article.image || '';
            document.getElementById('content').value = article.content;
            document.getElementById('isPublished').checked = article.isPublished;
            
            if (article.image) {
                document.getElementById('imagePreview').innerHTML = 
                    `<img src="${article.image}" alt="プレビュー" style="max-width: 200px; border-radius: 8px;">`;
            }
        }
    }

    deleteArticle(id) {
        if (confirm('この記事を削除しますか？')) {
            this.articles = this.articles.filter(article => article.id !== id);
            this.saveArticles();
            this.displayArticles();
        }
    }

    handleFileSelect(files) {
        this.selectedFiles = Array.from(files);
        this.displayUploadPreview();
    }

    displayUploadPreview() {
        const container = document.getElementById('uploadPreview');
        
        if (this.selectedFiles.length === 0) {
            container.innerHTML = '';
            return;
        }

        const html = this.selectedFiles.map((file, index) => {
            const url = URL.createObjectURL(file);
            return `
                <div class="preview-item">
                    <img src="${url}" alt="${file.name}">
                    <div class="file-info">
                        <div>${file.name}</div>
                        <small>${(file.size / 1024 / 1024).toFixed(2)} MB</small>
                    </div>
                    <button class="remove-btn" onclick="unifiedAdmin.removeFile(${index})">&times;</button>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    }

    removeFile(index) {
        this.selectedFiles.splice(index, 1);
        this.displayUploadPreview();
    }

    toggleFolderSelection() {
        const folderType = document.querySelector('input[name="folderType"]:checked').value;
        const articleSelect = document.getElementById('articleSelect');
        const newArticleName = document.getElementById('newArticleName');
        
        if (folderType === 'existing') {
            articleSelect.disabled = false;
            articleSelect.required = true;
            newArticleName.disabled = true;
            newArticleName.required = false;
        } else {
            articleSelect.disabled = true;
            articleSelect.required = false;
            newArticleName.disabled = false;
            newArticleName.required = true;
        }
    }

    validateArticleName(input) {
        const value = input.value;
        const validPattern = /^[a-z0-9-]+$/;
        
        if (value && !validPattern.test(value)) {
            input.setCustomValidity('英小文字、数字、ハイフンのみ使用できます');
        } else {
            input.setCustomValidity('');
        }
    }

    async createArticleFolder(articleName) {
        try {
            const result = await apiConfig.createFolder(articleName);
            return result.success;
        } catch (error) {
            console.error('フォルダ作成エラー:', error);
            return false;
        }
    }

    async handleImageUpload() {
        const folderType = document.querySelector('input[name="folderType"]:checked').value;
        const optimizeImage = document.getElementById('optimizeImage').checked;
        let articleName;

        if (folderType === 'existing') {
            articleName = document.getElementById('articleSelect').value;
            if (!articleName) {
                alert('記事を選択してください');
                return;
            }
        } else {
            articleName = document.getElementById('newArticleName').value;
            if (!articleName) {
                alert('新しい記事名を入力してください');
                return;
            }
            
            // 新しいフォルダを作成
            const folderCreated = await this.createArticleFolder(articleName);
            if (!folderCreated) {
                alert('フォルダの作成に失敗しました');
                return;
            }
        }

        if (this.selectedFiles.length === 0) {
            alert('画像ファイルを選択してください');
            return;
        }

        const uploadBtn = document.getElementById('uploadBtn');
        uploadBtn.disabled = true;
        uploadBtn.textContent = 'アップロード中...';

        try {
            const uploadedUrls = [];
            
            for (const file of this.selectedFiles) {
                let processedFile = file;
                if (optimizeImage && file.type.startsWith('image/')) {
                    processedFile = await this.optimizeImage(file);
                }

                const imageUrl = `${this.s3BaseUrl}/articles/${articleName}/${processedFile.name}`;
                
                // API経由でS3にアップロード
                const { uploadUrl, imageUrl } = await apiConfig.getUploadUrl(processedFile.name, articleName);
                await apiConfig.uploadToS3(uploadUrl, processedFile);
                
                this.uploadedImages.unshift({
                    articleName,
                    filename: processedFile.name,
                    url: imageUrl,
                    uploadDate: new Date().toISOString()
                });

                uploadedUrls.push(imageUrl);
            }

            this.saveUploadedImages();
            
            // 新しいフォルダを作成した場合、選択肢に追加
            const folderType = document.querySelector('input[name="folderType"]:checked').value;
            if (folderType === 'new') {
                this.addArticleOption(articleName);
            }

            this.showUploadResult(`
                <h3>✅ ${this.selectedFiles.length}件のアップロード完了!</h3>
                <p><strong>フォルダ:</strong> ${articleName}</p>
                ${uploadedUrls.map(url => `
                    <div style="margin: 0.5rem 0;">
                        <code>${url}</code>
                        <button onclick="navigator.clipboard.writeText('${url}')" style="margin-left: 0.5rem;">コピー</button>
                    </div>
                `).join('')}
            `, 'success');

            this.selectedFiles = [];
            this.displayUploadPreview();
            document.getElementById('imageUploadForm').reset();
            
            // ラジオボタンをリセット
            document.getElementById('existingFolder').checked = true;
            this.toggleFolderSelection();

        } catch (error) {
            this.showUploadResult(`アップロードに失敗しました: ${error.message}`, 'error');
        } finally {
            uploadBtn.disabled = false;
            uploadBtn.textContent = 'アップロード';
        }
    }

    async optimizeImage(file) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                const maxWidth = 1200;
                const maxHeight = 800;
                let { width, height } = img;

                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width *= ratio;
                    height *= ratio;
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    const optimizedFile = new File([blob], file.name, {
                        type: 'image/jpeg',
                        lastModified: Date.now()
                    });
                    resolve(optimizedFile);
                }, 'image/jpeg', 0.85);
            };

            img.src = URL.createObjectURL(file);
        });
    }

    showUploadResult(message, type) {
        const resultDiv = document.getElementById('uploadResult');
        resultDiv.innerHTML = message;
        resultDiv.className = `upload-result ${type}`;
        resultDiv.style.display = 'block';
        
        if (type === 'success') {
            setTimeout(() => {
                resultDiv.style.display = 'none';
            }, 10000);
        }
    }




}

// 初期化
let unifiedAdmin;
document.addEventListener('DOMContentLoaded', () => {
    unifiedAdmin = new UnifiedAdmin();
});