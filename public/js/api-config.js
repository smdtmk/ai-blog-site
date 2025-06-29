// API設定
class ApiConfig {
    constructor() {
        // API Gateway エンドポイント
        this.baseUrl = 'https://91j2anhglf.execute-api.ap-northeast-1.amazonaws.com/prod';
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // プリサインドURL取得
    async getUploadUrl(fileName, articleName) {
        return this.request('/upload-url', {
            method: 'POST',
            body: JSON.stringify({ fileName, articleName })
        });
    }

    // フォルダ作成
    async createFolder(articleName) {
        return this.request('/create-folder', {
            method: 'POST',
            body: JSON.stringify({ articleName })
        });
    }

    // 記事保存
    async saveArticle(content, articleName) {
        return this.request('/articles', {
            method: 'POST',
            body: JSON.stringify({ content, articleName })
        });
    }

    // S3に直接アップロード
    async uploadToS3(uploadUrl, file) {
        console.log('Uploading to S3:', {
            url: uploadUrl,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type
        });
        
        const response = await fetch(uploadUrl, {
            method: 'PUT',
            body: file,
            headers: {
                'Content-Type': file.type
            }
        });
        
        console.log('S3 response:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('S3 upload error details:', errorText);
            throw new Error(`S3 upload failed: ${response.status} ${response.statusText} - ${errorText}`);
        }
        
        return response;
    }
}

// グローバルインスタンス
const apiConfig = new ApiConfig();