// AWS CDKでAPI Gateway + Lambda作成
const { Stack, Duration, RemovalPolicy } = require('aws-cdk-lib');
const { RestApi, LambdaIntegration, Cors } = require('aws-cdk-lib/aws-apigateway');
const { Function, Runtime, Code } = require('aws-cdk-lib/aws-lambda');
const { PolicyStatement, Effect } = require('aws-cdk-lib/aws-iam');
const { Bucket, CorsRule, HttpMethods } = require('aws-cdk-lib/aws-s3');

class BlogApiStack extends Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    // S3バケット作成
    const imageBucket = new Bucket(this, 'ImageBucket', {
      bucketName: 'ai-blog-images-992382791277',
      cors: [{
        allowedOrigins: ['*'],
        allowedMethods: [HttpMethods.GET, HttpMethods.PUT, HttpMethods.POST, HttpMethods.DELETE, HttpMethods.HEAD],
        allowedHeaders: ['*'],
        exposedHeaders: ['ETag'],
        maxAge: 3000
      }],
      removalPolicy: RemovalPolicy.DESTROY
    });

    // Lambda関数作成
    const blogApiFunction = new Function(this, 'BlogApiFunction', {
      runtime: Runtime.NODEJS_18_X,
      handler: 'index.handler',
      environment: {
        BUCKET_NAME: imageBucket.bucketName
      },
      code: Code.fromInline(`
        const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
        const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
        const s3 = new S3Client({ region: 'ap-northeast-1' });
        const BUCKET_NAME = process.env.BUCKET_NAME;

        exports.handler = async (event) => {
          const headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Methods': '*'
          };

          try {
            const { httpMethod, path, body } = event;
            const requestBody = body ? JSON.parse(body) : {};

            if (httpMethod === 'POST' && event.resource === '/upload-url') {
              const { fileName, articleName } = requestBody;
              const key = \`articles/\${articleName}/\${fileName}\`;
              
              const command = new PutObjectCommand({
                Bucket: BUCKET_NAME,
                Key: key,
                ContentType: fileName.endsWith('.png') ? 'image/png' : 
                           fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') ? 'image/jpeg' : 
                           fileName.endsWith('.gif') ? 'image/gif' : 
                           fileName.endsWith('.webp') ? 'image/webp' : 'image/jpeg'
              });
              
              const signedUrl = await getSignedUrl(s3, command, { 
                expiresIn: 300
              });
              
              return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ 
                  uploadUrl: signedUrl,
                  imageUrl: \`https://\${BUCKET_NAME}.s3.ap-northeast-1.amazonaws.com/\${key}\`
                })
              };
            }

            if (httpMethod === 'POST' && event.resource === '/create-folder') {
              const { articleName } = requestBody;
              
              console.log('Creating folder for:', articleName);
              console.log('Bucket:', BUCKET_NAME);
              
              try {
                const command = new PutObjectCommand({
                  Bucket: BUCKET_NAME,
                  Key: \`articles/\${articleName}/\`,
                  Body: Buffer.from('')
                });
                
                await s3.send(command);
                
                console.log('Folder created successfully');
                return {
                  statusCode: 200,
                  headers,
                  body: JSON.stringify({ success: true, folder: articleName })
                };
              } catch (s3Error) {
                console.error('S3 Error:', s3Error);
                return {
                  statusCode: 500,
                  headers,
                  body: JSON.stringify({ 
                    error: 'S3 operation failed', 
                    details: s3Error.message,
                    bucket: BUCKET_NAME
                  })
                };
              }
            }

            if (httpMethod === 'POST' && event.resource === '/articles') {
              const { content, articleName } = requestBody;
              
              const command = new PutObjectCommand({
                Bucket: BUCKET_NAME,
                Key: \`articles/\${articleName}/index.md\`,
                Body: Buffer.from(content, 'utf8'),
                ContentType: 'text/markdown'
              });
              
              await s3.send(command);
              
              return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true, articleName })
              };
            }

            if (httpMethod === 'GET' && event.resource === '/articles') {
              const { ListObjectsV2Command, GetObjectCommand } = require('@aws-sdk/client-s3');
              
              try {
                // articles/フォルダ内のindex.mdファイルを取得
                const listCommand = new ListObjectsV2Command({
                  Bucket: BUCKET_NAME,
                  Prefix: 'articles/',
                  Delimiter: '/'
                });
                
                const listResult = await s3.send(listCommand);
                const articles = [];
                
                if (listResult.CommonPrefixes) {
                  for (const prefix of listResult.CommonPrefixes) {
                    const articleName = prefix.Prefix.replace('articles/', '').replace('/', '');
                    
                    try {
                      const getCommand = new GetObjectCommand({
                        Bucket: BUCKET_NAME,
                        Key: \`articles/\${articleName}/index.md\`
                      });
                      
                      const result = await s3.send(getCommand);
                      const content = await result.Body.transformToString();
                      
                      // フロントマターを解析
                      const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
                      if (frontMatterMatch) {
                        const frontMatter = frontMatterMatch[1];
                        const bodyContent = content.replace(/^---\n[\s\S]*?\n---\n/, '');
                        
                        const titleMatch = frontMatter.match(/title:\s*["'](.+?)["']/);
                        const title = titleMatch ? titleMatch[1] : articleName;
                        
                        const dateMatch = frontMatter.match(/date:\s*["'](.+?)["']/);
                        const date = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0];
                        
                        const emojiMatch = frontMatter.match(/emoji:\s*["'](.+?)["']/);
                        const emoji = emojiMatch ? emojiMatch[1] : '📝';
                        
                        const topicsMatch = frontMatter.match(/topics:\s*\[([^\]]+)\]/);
                        const topics = topicsMatch ? topicsMatch[1].split(',').map(t => t.trim().replace(/["']/g, '')) : [];
                        
                        const imageMatch = frontMatter.match(/image:\s*["'](.+?)["']/);
                        const image = imageMatch ? imageMatch[1] : null;
                        
                        const excerpt = bodyContent.replace(/[#*\`]/g, '').substring(0, 150) + '...';
                        
                        articles.push({
                          slug: articleName,
                          title: title,
                          date: date,
                          emoji: emoji,
                          topics: topics,
                          image: image,
                          excerpt: excerpt
                        });
                      }
                    } catch (error) {
                      console.log(\`Failed to load article \${articleName}:\`, error.message);
                      // 記事読み込みに失敗した場合はスキップ
                    }
                  }
                }
                
                // 日付順でソート（新しい順）
                articles.sort((a, b) => new Date(b.date) - new Date(a.date));
                
                return {
                  statusCode: 200,
                  headers,
                  body: JSON.stringify({ articles })
                };
              } catch (error) {
                console.error('Articles list error:', error);
                return {
                  statusCode: 500,
                  headers,
                  body: JSON.stringify({ error: 'Failed to load articles', articles: [] })
                };
              }
            }

            return {
              statusCode: 404,
              headers,
              body: JSON.stringify({ error: 'Not found' })
            };
          } catch (error) {
            return {
              statusCode: 500,
              headers,
              body: JSON.stringify({ error: error.message })
            };
          }
        };
      `),
      timeout: Duration.seconds(30)
    });

    // S3アクセス権限追加
    blogApiFunction.addToRolePolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        's3:PutObject', 
        's3:GetObject', 
        's3:ListBucket',
        's3:GetBucketLocation'
      ],
      resources: [
        imageBucket.bucketArn,
        `${imageBucket.bucketArn}/*`
      ]
    }));

    // API Gateway作成
    const api = new RestApi(this, 'BlogApi', {
      restApiName: 'AI Blog API',
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
        allowHeaders: ['*']
      }
    });

    const integration = new LambdaIntegration(blogApiFunction);
    
    // 個別エンドポイント作成
    const uploadUrl = api.root.addResource('upload-url');
    uploadUrl.addMethod('POST', integration);
    
    const createFolder = api.root.addResource('create-folder');
    createFolder.addMethod('POST', integration);
    
    const articles = api.root.addResource('articles');
    articles.addMethod('POST', integration);
    articles.addMethod('GET', integration);
    
    // API GatewayのCORSは自動設定される
  }
}

module.exports = { BlogApiStack };