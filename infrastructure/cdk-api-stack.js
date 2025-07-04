// AWS CDKでAPI Gateway + Lambda作成
const { Stack, Duration, RemovalPolicy } = require('aws-cdk-lib');
const { RestApi, LambdaIntegration, Cors } = require('aws-cdk-lib/aws-apigateway');
const { Function, Runtime, Code } = require('aws-cdk-lib/aws-lambda');
const { PolicyStatement, Effect } = require('aws-cdk-lib/aws-iam');
const { Bucket, CorsRule, HttpMethods } = require('aws-cdk-lib/aws-s3');
const path = require('path');

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
      handler: 'lambda-handler.handler',
      environment: {
        BUCKET_NAME: imageBucket.bucketName
      },
      code: Code.fromAsset(path.join(__dirname, 'lambda')),
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