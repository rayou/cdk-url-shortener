# API Reference

**Classes**

Name|Description
----|-----------
[URLShortener](#rayou-cdk-url-shortener-urlshortener)|Represents a URL shortener.


**Structs**

Name|Description
----|-----------
[CustomDomainOptions](#rayou-cdk-url-shortener-customdomainoptions)|Properties to configure a domain name.
[URLShortenerProps](#rayou-cdk-url-shortener-urlshortenerprops)|Properties to configure a URL shortener.



## class URLShortener 🔹 <a id="rayou-cdk-url-shortener-urlshortener"></a>

Represents a URL shortener.

Use `addDomainName` to configure a custom domain.

By default, this construct will deploy:

- An API Gateway API that can be accessed from a public endpoint.
- A DynamoDB table for storing links.
- A Lambda Function for shortening the link and storing it to DynamoDB table.

__Implements__: [IConstruct](#constructs-iconstruct), [IConstruct](#aws-cdk-core-iconstruct), [IConstruct](#constructs-iconstruct), [IDependable](#aws-cdk-core-idependable)
__Extends__: [Construct](#aws-cdk-core-construct)

### Initializer




```ts
new URLShortener(scope: Construct, id: string, props?: URLShortenerProps)
```

* **scope** (<code>[Construct](#aws-cdk-core-construct)</code>)  *No description*
* **id** (<code>string</code>)  *No description*
* **props** (<code>[URLShortenerProps](#rayou-cdk-url-shortener-urlshortenerprops)</code>)  *No description*
  * **dynamoTable** (<code>[Table](#aws-cdk-aws-dynamodb-table)</code>)  The DynamoDB table used for storing links. __*Default*__: A new DynamoDB Table is created.



### Properties


Name | Type | Description 
-----|------|-------------
*static* **defaultDynamoTableProps**🔹 | <code>[TableProps](#aws-cdk-aws-dynamodb-tableprops)</code> | Default table props with partition key set to `id`, you can use it to extend your `TableProps`.

### Methods


#### addDomainName(options)🔹 <a id="rayou-cdk-url-shortener-urlshortener-adddomainname"></a>



```ts
addDomainName(options: CustomDomainOptions): URLShortener
```

* **options** (<code>[CustomDomainOptions](#rayou-cdk-url-shortener-customdomainoptions)</code>)  *No description*
  * **domainName** (<code>string</code>)  Domain name to be associated with URL shortener service, supports apex domain and subdomain. 
  * **zone** (<code>[IHostedZone](#aws-cdk-aws-route53-ihostedzone)</code>)  Hosted zone of the domain which will be used to create alias record(s) from domain name in the hosted zone to URL shortener API endpoint. 
  * **certificate** (<code>[ICertificate](#aws-cdk-aws-certificatemanager-icertificate)</code>)  The AWS Certificate Manager (ACM) certificate that will be associated with the URL shortener that will be created. __*Default*__: A new DNS validated certificate is created in the same region.

__Returns__:
* <code>[URLShortener](#rayou-cdk-url-shortener-urlshortener)</code>



## struct CustomDomainOptions 🔹 <a id="rayou-cdk-url-shortener-customdomainoptions"></a>


Properties to configure a domain name.



Name | Type | Description 
-----|------|-------------
**domainName**🔹 | <code>string</code> | Domain name to be associated with URL shortener service, supports apex domain and subdomain.
**zone**🔹 | <code>[IHostedZone](#aws-cdk-aws-route53-ihostedzone)</code> | Hosted zone of the domain which will be used to create alias record(s) from domain name in the hosted zone to URL shortener API endpoint.
**certificate**?🔹 | <code>[ICertificate](#aws-cdk-aws-certificatemanager-icertificate)</code> | The AWS Certificate Manager (ACM) certificate that will be associated with the URL shortener that will be created.<br/>__*Default*__: A new DNS validated certificate is created in the same region.



## struct URLShortenerProps 🔹 <a id="rayou-cdk-url-shortener-urlshortenerprops"></a>


Properties to configure a URL shortener.



Name | Type | Description 
-----|------|-------------
**dynamoTable**?🔹 | <code>[Table](#aws-cdk-aws-dynamodb-table)</code> | The DynamoDB table used for storing links.<br/>__*Default*__: A new DynamoDB Table is created.



