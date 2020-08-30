import { App, Stack, Construct, StackProps } from '@aws-cdk/core';
import * as route53 from '@aws-cdk/aws-route53';
import { URLShortener } from '../src';

const app = new App();

class CustomDomainStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const zone = route53.HostedZone.fromLookup(this, 'HostedZone', {
      domainName: 'mydomain.com',
    });

    new URLShortener(this, 'myURLShortener').addDomainName({
      domainName: 'foo.mydomain.com',
      zone,
    });
  }
}

new CustomDomainStack(app, 'testCustomDomainStack', {
  env: {
    region: process.env.CDK_DEFAULT_REGION,
    account: process.env.CDK_DEFAULT_ACCOUNT,
  },
});
