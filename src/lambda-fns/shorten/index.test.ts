import { APIGatewayProxyEvent } from 'aws-lambda';

import { handler } from './';
import { makeHandler, Deps, Args, Handler } from './handler';

const mockId = 'asdfg';
const mockUrl = 'https://mydomain.com';
const mockHandler = jest.fn().mockResolvedValue(mockId);
const mockMakeBuilder = makeHandler as jest.Mock<Handler, [Deps, Args]>;

jest.mock('./handler', () => ({
  makeHandler: jest.fn(() => mockHandler),
}));

const mockEvent: APIGatewayProxyEvent = {
  resource: '/',
  path: '/',
  httpMethod: 'POST',
  headers: {},
  queryStringParameters: null,
  pathParameters: null,
  stageVariables: null,
  //@ts-ignore
  requestContext: {},
  multiValueHeaders: {},
  multiValueQueryStringParameters: null,
  body: `{"url":"${mockUrl}"}`,
  isBase64Encoded: false,
};

afterEach(() => {
  jest.clearAllMocks();
});

test('takes a URL and returns a successful API Gateway response', async () => {
  const response = await handler(mockEvent);

  expect(mockMakeBuilder).toBeCalledTimes(1);
  expect(mockHandler).toBeCalledWith(mockUrl);
  expect(response).toEqual({
    statusCode: 201,
    body: JSON.stringify({
      id: mockId,
    }),
  });
});

test('takes an incorrect format body and returns an error API Gateway response', async () => {
  const eventWithIncorrectFormatBody = {
    ...mockEvent,
    body: 'not a JSON',
  };

  const response = await handler(eventWithIncorrectFormatBody);
  expect(response.statusCode).toEqual(400);
  expect(JSON.parse(response.body).message).toMatch(/error has occurred/i);
});

test('ensures TABLE_NAME and KEY_NAME are provided as expected', async () => {
  const realEnv = process.env;
  const tableName = 'testTableName';
  const keyName = 'testKeyName';

  process.env.TABLE_NAME = tableName;
  process.env.KEY_NAME = keyName;

  await handler(mockEvent);

  const args = mockMakeBuilder.mock.calls[0][1];

  expect(args.tableName).toEqual(tableName);
  expect(args.keyName).toEqual(keyName);
  process.env = realEnv;
});

test('deps.ts() returns a timestamp', async () => {
  const realNow = global.Date.now;
  global.Date.now = jest.fn().mockReturnValue(1234567890123);

  await handler(mockEvent);

  const deps = mockMakeBuilder.mock.calls[0][0];
  expect(deps.ts()).toEqual(1234567890123);
  global.Date.now = realNow;
});
