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
        const AWS = require('aws-sdk');
        const s3 = new AWS.S3();
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
              
              const signedUrl = s3.getSignedUrl('putObject', {
                Bucket: BUCKET_NAME,
                Key: key,
                Expires: 300,
                ContentType: 'image/*'
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
              
              await s3.putObject({
                Bucket: BUCKET_NAME,
                Key: \`articles/\${articleName}/\`,
                Body: ''
              }).promise();
              
              return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true, folder: articleName })
              };
            }

            if (httpMethod === 'POST' && event.resource === '/articles') {
              const { content, articleName } = requestBody;
              
              await s3.putObject({
                Bucket: BUCKET_NAME,
                Key: \`articles/\${articleName}/index.md\`,
                Body: content,
                ContentType: 'text/markdown'
              }).promise();
              
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
      actions: ['s3:PutObject', 's3:GetObject'],
      resources: ['arn:aws:s3:::ai-blog-images-992382791277/*']
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