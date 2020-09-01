# cdk-url-shortener <!-- omit in toc -->

![Release](https://github.com/rayou/cdk-url-shortener/workflows/Release/badge.svg) [![npm](https://img.shields.io/npm/v/@rayou/cdk-url-shortener)](https://www.npmjs.com/package/@rayou/cdk-url-shortener) [![PyPI](https://img.shields.io/pypi/v/rayou.cdk_url_shortener)](https://pypi.org/project/rayou.cdk-url-shortener/) [![Maven Central](https://img.shields.io/maven-central/v/com.github.rayou/cdk-url-shortener)](https://search.maven.org/artifact/com.github.rayou/cdk-url-shortener) [![Nuget](https://img.shields.io/nuget/v/CDK.URLShortener)](https://www.nuget.org/packages/CDK.URLShortener/)

> Deploy a URL shortener with custom domain support in just a few lines of code.

`cdk-url-shortener` is an AWS CDK L3 construct that will create a URL shortener with [custom domain](#custom-domain) support. The service uses [nanoid](https://github.com/ai/nanoid) to generate URL-friendly unique IDs and will retry if an ID collision occurs.

Additionally, you can enable [DynamoDB streams](#enable-dynamodb-streams) to capture changes to items stored in the DynamoDB table.

**Table of Contents**

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
  - [Basic](#basic)
  - [Custom Domain](#custom-domain)
  - [Multiple Custom Domains](#multiple-custom-domains)
  - [Enable DynamoDB Streams](#enable-dynamodb-streams)
- [Create your first short URL](#create-your-first-short-url)
- [Documentation](#documentation)
  - [Construct API Reference](#construct-api-reference)
  - [URL Shortener API Endpoints](#url-shortener-api-endpoints)
    - [Shorten a Link](#shorten-a-link)
    - [Visit a shortened URL](#visit-a-shortened-url)
- [Supporting this project](#supporting-this-project)
- [License](#license)

## Features

- 🚀 Easy to Start - One-liner code to have your own URL shortener.
- 🏢 Custom Domain - Bring your custom domain name that fits your brand.
- 📡 DynamoDB Streams - Capture table activity with DynamoDB Streams.

## Installation

TypeScript/JavaScript

```sh
$ npm install @rayou/cdk-url-shortener
```

Python

```sh
$ pip install rayou.cdk-url-shortener
```

.Net

```sh
$ nuget install CDK.URLShortener

# See more: https://www.nuget.org/packages/CDK.URLShortener/
```

## Usage

### Basic

```ts
import { URLShortener } from '@rayou/cdk-url-shortener';

new URLShortener(this, 'myURLShortener');
```

### Custom Domain

```ts
import * as route53 from '@aws-cdk/aws-route53';
import * as acm from '@aws-cdk/aws-certificatemanager';
import { URLShortener } from '@rayou/cdk-url-shortener';

const zone = route53.HostedZone.fromLookup(this, 'HostedZone', {
  domainName: 'mydomain.com',
});

// Optional, a DNS validated certificate will be created if not provided.
const certificate = acm.Certificate.fromCertificateArn(
  this,
  'Certificate',
  'arn:aws:acm:region:123456789012:certificate/12345678-1234-1234-1234-123456789012',
);

new URLShortener(this, 'myURLShortener').addDomainName({
  domainName: 'foo.mydomain.com',
  zone,
  certificate,
});
```

### Multiple Custom Domains

```ts
import * as route53 from '@aws-cdk/aws-route53';
import { URLShortener } from '@rayou/cdk-url-shortener';

const zone = route53.HostedZone.fromLookup(this, 'HostedZone', {
  domainName: 'mydomain.com',
});

new URLShortener(this, 'myURLShortener')
  .addDomainName({
    domainName: 'foo.mydomain.com',
    zone,
  })
  .addDomainName({
    domainName: 'bar.mydomain.com',
    zone,
  });
```

⚠️ Please note that although we have added two custom domains, they are pointed to the same URL shortener instance sharing the same DynamoDB table, if you need both domains run independently, create a new URL shortener instance.

### Enable DynamoDB Streams

```ts
import * as lambda from '@aws-cdk/aws-lambda';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as lambdaEventSources from '@aws-cdk/aws-lambda-event-sources';

import { URLShortener } from '@rayou/cdk-url-shortener';

const table = new dynamodb.Table(this, 'Table', {
  partitionKey: {
    name: 'id',
    type: dynamodb.AttributeType.STRING,
  },
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
```

## Create your first short URL

1. After the deployment, you'll see `ApiKeyURL` and `ApiEndpoint` in CDK Outputs, visit `ApiKeyURL` to get your API key.

   ```shell
   Outputs:
   stack.CustomDomainApiEndpointcc4157 = https://mydomain.com
   stack.myURLShortenerApiEndpoint47185311 = https://yrzxcvbafk.execute-api.us-west-2.amazonaws.com/prod/
   stack.ApiKeyURL = https://console.aws.amazon.com/apigateway/home?#/api-keys/k2zxcvbafw6
   ```

2. Run this cURL command to create your first short URL, an `ID` will be returned in the response.

   ```sh
   $ curl https://{API_ENDPOINT} /
       -X POST \
       -H 'content-type: application/json' \
       -H 'x-api-key: {API_KEY}' \
       -d '{
         "url": "https://github.com/rayou/cdk-url-shortener"
       }'

   {"id":"LDkPh"}
   ```

3. Visit `https://{API_ENDPOINT}/{ID}` then you'll be redirected to the destination URL.

   ```sh
   $ curl -v https://{API_ENDPOINT}/{ID} # e.g. https://mydomain.com/LDkPh

   < HTTP/2 301
   < content-type: text/html; charset=UTF-8
   < content-length: 309
   < location: https://github.com/rayou/cdk-url-shortener

   <!DOCTYPE html><html><head><meta charset="UTF-8" /><meta http-equiv="refresh" content="0;url=https://github.com/rayou/cdk-url-shortener" /><title>Redirecting to https://github.com/rayou/cdk-url-shortener</title></head><body>Redirecting to <a href="https://github.com/rayou/cdk-url-shortener">https://github.com/rayou/cdk-url-shortener</a>.</body></html>
   ```

## Documentation

### Construct API Reference

See [API.md](./API.md).

### URL Shortener API Endpoints

#### Shorten a Link

**HTTP REQUEST**

`POST /`

**HEADERS**

| Name           | Value                      | Required |
| -------------- | -------------------------- | -------- |
| `content-type` | `application/json`         | Required |
| `x-api-key`    | Get your api key [here][1] | Required |

[1]: https://console.aws.amazon.com/apigateway/home?#/api-keys

**ARGUMENTS**

| Parameter | Type   | Required | Description     |
| --------- | ------ | -------- | --------------- |
| `url`     | string | Required | Destination URL |

**Example Request**

```sh
curl https://mydomain.com /
  -X POST \
  -H 'content-type: application/json' \
  -H 'x-api-key: v3rYsEcuRekey' \
  -d '{
    "url": "https://github.com/rayou/cdk-url-shortener"
  }'
```

**Response (201)**

```json
{
  "id": "LDkPh"
}
```

#### Visit a shortened URL

**HTTP REQUEST**

`GET /:id`

**Example Request**

```sh
curl https://mydomain.com/:id
```

**Response (301)**

```sh
< HTTP/2 301
< content-type: text/html; charset=UTF-8
< content-length: 309
< location: https://github.com/rayou/cdk-url-shortener

<!DOCTYPE html><html><head><meta charset="UTF-8" /><meta http-equiv="refresh" content="0;url=https://github.com/rayou/cdk-url-shortener" /><title>Redirecting to https://github.com/rayou/cdk-url-shortener</title></head><body>Redirecting to <a href="https://github.com/rayou/cdk-url-shortener">https://github.com/rayou/cdk-url-shortener</a>.</body></html>
```

## Supporting this project

I'm working on this project in my free time, if you like my project, or found it helpful and would like to support me, you can buy me a coffee, any contributions are much appreciated! ❤️

<a href="https://www.buymeacoffee.com/rayou" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me A Coffee" style="height: 51px !important;width: 217px !important;" ></a>

## License

This project is distributed under the [Apache License, Version 2.0](./LICENSE).
