// AWS CDKでAPI Gateway + Lambda作成
const { Stack, Duration } = require('aws-cdk-lib');
const { RestApi, LambdaIntegration, Cors } = require('aws-cdk-lib/aws-apigateway');
const { Function, Runtime, Code } = require('aws-cdk-lib/aws-lambda');
const { PolicyStatement, Effect } = require('aws-cdk-lib/aws-iam');

class BlogApiStack extends Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    // Lambda関数作成
    const blogApiFunction = new Function(this, 'BlogApiFunction', {
      runtime: Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: Code.fromInline(`
        const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
        const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
        const s3 = new S3Client({ region: 'ap-northeast-1' });
        const BUCKET_NAME = 'ai-blog-images-992382791277';

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
                expiresIn: 300,
                signableHeaders: new Set(['content-type'])
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
                  Body: ''
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
                Body: content,
                ContentType: 'text/markdown'
              });
              
              await s3.send(command);
              
              return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true, articleName })
              };
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
        'arn:aws:s3:::ai-blog-images-992382791277',
        'arn:aws:s3:::ai-blog-images-992382791277/*'
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
    
    // API GatewayのCORSは自動設定される
  }
}

module.exports = { BlogApiStack };