import { App, Stack, Construct, StackProps } from '@aws-cdk/core';
import * as route53 from '@aws-cdk/aws-route53';
import * as acm from '@aws-cdk/aws-certificatemanager';
import { URLShortener } from '../src';

const app = new App();

class CustomDomainCertStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const certificate = acm.Certificate.fromCertificateArn(
      this,
      'Certificate',
      'arn:aws:acm:region:123456789012:certificate/12345678-1234-1234-1234-123456789012',
    );

    const zone = route53.HostedZone.fromLookup(this, 'HostedZone', {
      domainName: 'mydomain.com',
    });

    new URLShortener(this, 'myURLShortener').addDomainName({
      domainName: 'foo.mydomain.com',
      zone,
      certificate,
    });
  }
}

new CustomDomainCertStack(app, 'testCustomDomainCertStack', {
  env: {
    region: process.env.CDK_DEFAULT_REGION,
    account: process.env.CDK_DEFAULT_ACCOUNT,
  },
});
