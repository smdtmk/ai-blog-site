#!/usr/bin/env node
const { App } = require('aws-cdk-lib');
const { BlogApiStack } = require('./cdk-api-stack');

const app = new App();
new BlogApiStack(app, 'BlogApiStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'ap-northeast-1'
  }
});

app.synth();