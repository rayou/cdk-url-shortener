import { App, Stack, Construct, StackProps } from '@aws-cdk/core';
import { URLShortener } from '../src';

const app = new App();

class BasicStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new URLShortener(this, 'myURLShortener');
  }
}

new BasicStack(app, 'testBasicStack', {
  env: {
    region: process.env.CDK_DEFAULT_REGION,
    account: process.env.CDK_DEFAULT_ACCOUNT,
  },
});
