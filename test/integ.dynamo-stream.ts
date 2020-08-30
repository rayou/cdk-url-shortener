import { App, Stack, Construct, StackProps } from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as lambdaEventSources from '@aws-cdk/aws-lambda-event-sources';

import { URLShortener } from '../src';

const app = new App();

class DynamoDBStreamStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const table = new dynamodb.Table(this, 'Table', {
      ...URLShortener.defaultDynamoTableProps,
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
    });

    new URLShortener(this, 'myURLShortener', {
      dynamoTable: table,
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

    const lambdaFn = new lambda.Function(this, 'myStreamHandler', {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(streamHandlerCode),
    });

    lambdaFn.addEventSource(
      new lambdaEventSources.DynamoEventSource(table, {
        startingPosition: lambda.StartingPosition.LATEST,
      }),
    );
  }
}

new DynamoDBStreamStack(app, 'testDynamoDBStreamStack', {
  env: {
    region: process.env.CDK_DEFAULT_REGION,
    account: process.env.CDK_DEFAULT_ACCOUNT,
  },
});
