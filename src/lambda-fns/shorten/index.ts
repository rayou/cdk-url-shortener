import { DynamoDB } from 'aws-sdk';
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { customAlphabet, urlAlphabet } from 'nanoid';
import { makeHandler, Deps, Args } from './handler';

const MAX_RETRY = 10;
const ID_SIZE = 5;

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const deps: Deps = {
    docClient: new DynamoDB.DocumentClient(),
    idGenerator: customAlphabet(urlAlphabet, ID_SIZE),
    ts: Date.now,
  };

  const args: Args = {
    tableName: process.env.TABLE_NAME as string,
    keyName: process.env.KEY_NAME as string,
    maxRetries: MAX_RETRY,
    idLength: ID_SIZE,
  };

  try {
    // Body has been validated by API Gateway, so we can safely cast it as string here.
    const { url } = JSON.parse(event.body as string);
    const id = await makeHandler(deps, args)(url);

    return { statusCode: 201, body: `{"id":"${id}"}` };
  } catch (e) {
    return {
      statusCode: 400,
      body: '{"message":"An error has occurred, please try again later."}',
    };
  }
};
