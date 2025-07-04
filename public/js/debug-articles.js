// デバッグ用スクリプト
console.log('デバッグ開始: 記事読み込み確認');

// APIテスト
async function testAPI() {
    try {
        console.log('API URL:', 'https://91j2anhglf.execute-api.ap-northeast-1.amazonaws.com/prod/articles');
        
        const response = await fetch('https://91j2anhglf.execute-api.ap-northeast-1.amazonaws.com/prod/articles');
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        const data = await response.json();
        console.log('API Response:', data);
        console.log('記事数:', data.articles ? data.articles.length : 0);
        
        if (data.articles && data.articles.length > 0) {
            console.log('最初の記事:', data.articles[0]);
        }
        
    } catch (error) {
        console.error('API Error:', error);
    }
}

// DOM確認
function checkDOM() {
    const container = document.querySelector('.articles-grid');
    console.log('記事コンテナ:', container);
    console.log('コンテナの内容:', container ? container.innerHTML : 'なし');
}

// 実行
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM読み込み完了');
    checkDOM();
    testAPI();
});