// 簡単なExpress APIサーバー（開発用）
const express = require('express');
const cors = require('cors');
const AWS = require('aws-sdk');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const s3 = new AWS.S3({
  region: 'ap-northeast-1'
});
const BUCKET_NAME = 'ai-blog-images-992382791277';

// プリサインドURL生成
app.post('/api/upload-url', async (req, res) => {
  try {
    const { fileName, articleName } = req.body;
    const key = `articles/${articleName}/${fileName}`;
    
    const signedUrl = s3.getSignedUrl('putObject', {
      Bucket: BUCKET_NAME,
      Key: key,
      Expires: 300,
      ContentType: 'image/*'
    });
    
    res.json({ 
      uploadUrl: signedUrl,
      imageUrl: `https://${BUCKET_NAME}.s3.ap-northeast-1.amazonaws.com/${key}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// フォルダ作成
app.post('/api/create-folder', async (req, res) => {
  try {
    const { articleName } = req.body;
    
    await s3.putObject({
      Bucket: BUCKET_NAME,
      Key: `articles/${articleName}/`,
      Body: ''
    }).promise();
    
    res.json({ success: true, folder: articleName });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 記事保存
app.post('/api/articles', async (req, res) => {
  try {
    const { content, articleName } = req.body;
    
    await s3.putObject({
      Bucket: BUCKET_NAME,
      Key: `articles/${articleName}/index.md`,
      Body: content,
      ContentType: 'text/markdown'
    }).promise();
    
    res.json({ success: true, articleName });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
});

module.exports = app;