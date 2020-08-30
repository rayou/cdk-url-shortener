import { Stack } from '@aws-cdk/core';
import { HostedZone } from '@aws-cdk/aws-route53/lib/hosted-zone';
import { Certificate } from '@aws-cdk/aws-certificatemanager';
import { Table, StreamViewType, AttributeType } from '@aws-cdk/aws-dynamodb';
import { Function, Runtime, Code, StartingPosition } from '@aws-cdk/aws-lambda';
import { DynamoEventSource } from '@aws-cdk/aws-lambda-event-sources';
// eslint-disable-next-line import/no-extraneous-dependencies
import { SynthUtils } from '@aws-cdk/assert';
// eslint-disable-next-line import/no-extraneous-dependencies
import '@aws-cdk/assert/jest';

import { URLShortener } from '../src';

test('basic setup', () => {
  const stack = new Stack();

  new URLShortener(stack, 'myURLShortenerBasic');

  expect(stack).toHaveResource('AWS::ApiGateway::RestApi');
  expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
});

test('custom domain', () => {
  const stack = new Stack();

  const zone = HostedZone.fromHostedZoneAttributes(stack, 'HostedZone', {
    hostedZoneId: 'fakeZoneId',
    zoneName: 'mydomain.com',
  });

  new URLShortener(stack, 'myURLShortenerCustomDomain').addDomainName({
    domainName: 'subdomain.mydomain.com',
    zone,
  });

  expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
});

test('multiple custom domains', () => {
  const stack = new Stack();

  const zone = HostedZone.fromHostedZoneAttributes(stack, 'HostedZone', {
    hostedZoneId: 'fakeZoneId',
    zoneName: 'mydomain.com',
  });

  new URLShortener(stack, 'myURLShortenerCustomDomains')
    .addDomainName({
      domainName: 'mydomain.com',
      zone,
    })
    .addDomainName({
      domainName: 'foo.mydomain.com',
      zone,
    })
    .addDomainName({
      domainName: 'bar.mydomain.com',
      zone,
    });

  expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
});

test('custom domain and existing certificate', () => {
  const stack = new Stack();

  const certificate = Certificate.fromCertificateArn(
    stack,
    'Certificate',
    'arn:aws:acm:region:123456789012:certificate/12345678-1234-1234-1234-123456789012',
  );

  const zone = HostedZone.fromHostedZoneAttributes(stack, 'HostedZone', {
    hostedZoneId: 'fakeZoneId',
    zoneName: 'mydomain.com',
  });

  new URLShortener(stack, 'myURLShortenerCustomDomaiCertificate').addDomainName(
    {
      domainName: 'foo.mydomain.com',
      zone,
      certificate,
    },
  );

  expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
});

test('dynamodb stream', () => {
  const stack = new Stack();

  const dynamoTable = new Table(stack, 'Table', {
    partitionKey: {
      name: 'foobar',
      type: AttributeType.STRING,
    },
    stream: StreamViewType.NEW_AND_OLD_IMAGES,
  });

  new URLShortener(stack, 'myURLShortenerDynamoStream', {
    dynamoTable,
  });

  const streamHandlerCode = `'use strict';
exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  for (const record of event.Records) {
    console.log(record.eventID);
    console.log(record.eventName);
    console.log('DynamoDB Record: %j', record.dynamodb);
  }
  console.log(\`Successfully processed \${event.Records.length} records.\`);
};`;

  const lambdaFn = new Function(stack, 'Function', {
    runtime: Runtime.NODEJS_12_X,
    handler: 'index.handler',
    code: Code.fromInline(streamHandlerCode),
  });

  lambdaFn.addEventSource(
    new DynamoEventSource(dynamoTable, {
      startingPosition: StartingPosition.TRIM_HORIZON,
    }),
  );

  expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
});
