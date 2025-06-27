class ImageManager {
    constructor() {
        this.bucketName = 'ai-blog-images-992382791277';
        this.s3BaseUrl = `https://${this.bucketName}.s3.ap-northeast-1.amazonaws.com`;
        this.uploadedImages = this.loadUploadedImages();
        this.initEventListeners();
        this.displayImages();
    }

    initEventListeners() {
        document.getElementById('imageUploadForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleImageUpload();
        });

        document.getElementById('imageFile').addEventListener('change', (e) => {
            this.showImagePreview(e.target.files[0]);
        });
    }

    showImagePreview(file) {
        if (!file) return;

        const preview = document.getElementById('imagePreview');
        const reader = new FileReader();
        
        reader.onload = (e) => {
            preview.innerHTML = `
                <img src="${e.target.result}" alt="プレビュー" style="max-width: 300px; max-height: 200px; border-radius: 8px;">
                <p>ファイル名: ${file.name}</p>
                <p>サイズ: ${(file.size / 1024 / 1024).toFixed(2)} MB</p>
            `;
        };
        
        reader.readAsDataURL(file);
    }

    async handleImageUpload() {
        const articleName = document.getElementById('articleSelect').value;
        const imageFile = document.getElementById('imageFile').files[0];
        const optimizeImage = document.getElementById('optimizeImage').checked;
        const uploadBtn = document.getElementById('uploadBtn');
        const resultDiv = document.getElementById('uploadResult');

        if (!articleName || !imageFile) {
            this.showResult('記事と画像ファイルを選択してください', 'error');
            return;
        }

        uploadBtn.disabled = true;
        uploadBtn.textContent = 'アップロード中...';

        try {
            // 画像を最適化
            let processedFile = imageFile;
            if (optimizeImage) {
                processedFile = await this.optimizeImage(imageFile);
            }

            // S3にアップロード（実際の実装ではAWS SDKを使用）
            const imageUrl = await this.uploadToS3(articleName, processedFile);
            
            // アップロード履歴を保存
            this.saveUploadedImage({
                articleName,
                filename: processedFile.name,
                url: imageUrl,
                uploadDate: new Date().toISOString()
            });

            this.showResult(`
                <h3>✅ アップロード完了!</h3>
                <p><strong>URL:</strong> <code>${imageUrl}</code></p>
                <p><strong>フロントマター用:</strong></p>
                <code>image: "${imageUrl}"</code>
                <p><strong>記事内用:</strong></p>
                <code>![説明文](${imageUrl})</code>
                <button onclick="navigator.clipboard.writeText('${imageUrl}')">URLをコピー</button>
            `, 'success');

            this.displayImages();
            document.getElementById('imageUploadForm').reset();
            document.getElementById('imagePreview').innerHTML = '';

        } catch (error) {
            this.showResult(`アップロードに失敗しました: ${error.message}`, 'error');
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
                // リサイズ計算
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

    async uploadToS3(articleName, file) {
        // 実際の実装では AWS SDK for JavaScript を使用
        // ここではシミュレーション
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const filename = file.name;
        const imageUrl = `${this.s3BaseUrl}/articles/${articleName}/${filename}`;
        
        // 実際のS3アップロード処理をここに実装
        console.log('S3アップロード:', { articleName, filename, size: file.size });
        
        return imageUrl;
    }

    loadUploadedImages() {
        const stored = localStorage.getItem('uploadedImages');
        return stored ? JSON.parse(stored) : [];
    }

    saveUploadedImage(imageData) {
        this.uploadedImages.unshift(imageData);
        localStorage.setItem('uploadedImages', JSON.stringify(this.uploadedImages));
    }

    displayImages() {
        const container = document.getElementById('imagesList');
        
        if (this.uploadedImages.length === 0) {
            container.innerHTML = '<p>まだ画像がアップロードされていません。</p>';
            return;
        }

        const html = this.uploadedImages.map(image => `
            <div class="image-item">
                <img src="${image.url}" alt="${image.filename}" class="thumbnail">
                <div class="image-info">
                    <h4>${image.filename}</h4>
                    <p>記事: ${image.articleName}</p>
                    <p>アップロード日: ${new Date(image.uploadDate).toLocaleDateString('ja-JP')}</p>
                    <div class="image-actions">
                        <button onclick="navigator.clipboard.writeText('${image.url}')">URLコピー</button>
                        <button onclick="imageManager.deleteImage('${image.url}')">削除</button>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = html;
    }

    deleteImage(url) {
        if (confirm('この画像を削除しますか？')) {
            this.uploadedImages = this.uploadedImages.filter(img => img.url !== url);
            localStorage.setItem('uploadedImages', JSON.stringify(this.uploadedImages));
            this.displayImages();
        }
    }

    showResult(message, type) {
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
let imageManager;
document.addEventListener('DOMContentLoaded', () => {
    imageManager = new ImageManager();
});