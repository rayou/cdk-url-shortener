import type { AWSError } from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

import { makeHandler, Deps, Args } from './handler';

const dynamodbDuplicateError = new Error(
  'The conditional request failed.',
) as AWSError;
dynamodbDuplicateError.code = 'ConditionalCheckFailedException';

const mockPutPromise = jest.fn().mockRejectedValue(dynamodbDuplicateError);
jest.mock('aws-sdk/clients/dynamodb', () => ({
  DocumentClient: jest.fn(() => ({
    put: jest.fn(() => ({ promise: mockPutPromise })),
  })),
}));

const url = 'https://mydomain.com';
const shortUrlId = 'zxcvb';
const ts = 1234567890;

const deps: Deps = {
  docClient: new DocumentClient(),
  idGenerator: jest.fn(() => shortUrlId),
  ts: jest.fn(() => ts),
};

const args: Args = {
  tableName: 'mockTableName',
  keyName: 'mockKeyName',
  idLength: 5,
  maxRetries: 5,
};

const handler = makeHandler(deps, args);

afterEach(() => {
  jest.clearAllMocks();
});

test('takes a URL then returns an ID', async () => {
  mockPutPromise.mockResolvedValue({});

  const id = await handler(url);

  expect(id).toEqual(shortUrlId);
  expect(deps.docClient.put).toBeCalledTimes(1);
  expect(deps.docClient.put).toBeCalledWith({
    ConditionExpression: `attribute_not_exists(${args.keyName})`,
    TableName: args.tableName,
    Item: {
      [args.keyName]: shortUrlId,
      url,
      clicks: 0,
      createdAt: ts,
    },
  });
});

test('retries when short url id exists', async () => {
  const expectedCalls = [
    [Promise.reject(dynamodbDuplicateError), 'zxcvb'],
    [Promise.reject(dynamodbDuplicateError), 'asdfg'],
    [Promise.resolve(), 'qwert'],
  ];

  expectedCalls.forEach(([result, id]) => {
    mockPutPromise.mockResolvedValueOnce(result);
    (deps.idGenerator as jest.Mock).mockReturnValueOnce(id);
  });

  const id = await handler(url);

  expect(id).toEqual('qwert');
  expect(deps.docClient.put).toBeCalledTimes(3);
  expectedCalls.forEach(([_, id], i) => {
    expect((deps.docClient.put as jest.Mock).mock.calls[i][0]).toEqual({
      ConditionExpression: `attribute_not_exists(${args.keyName})`,
      TableName: args.tableName,
      Item: {
        [args.keyName]: id,
        url,
        clicks: 0,
        createdAt: ts,
      },
    });
  });
});

test('throws error when max retries exceeded', async () => {
  const expectedCalls = [
    [dynamodbDuplicateError, 'zxcvb'],
    [dynamodbDuplicateError, 'asdfg'],
    [dynamodbDuplicateError, 'qwert'],
    [dynamodbDuplicateError, '6yhn7'],
    [dynamodbDuplicateError, '8ikm7'],
  ];

  expectedCalls.forEach(([error, id]) => {
    mockPutPromise.mockRejectedValueOnce(error);
    (deps.idGenerator as jest.Mock).mockReturnValueOnce(id);
  });

  try {
    await handler(url);
  } catch (e) {
    expect(e.message).toMatch(/The conditional request failed./i);
  }

  expect(deps.docClient.put).toBeCalledTimes(5);
  expectedCalls.forEach(([_, id], i) => {
    expect((deps.docClient.put as jest.Mock).mock.calls[i][0]).toEqual({
      ConditionExpression: `attribute_not_exists(${args.keyName})`,
      TableName: args.tableName,
      Item: {
        [args.keyName]: id,
        url,
        clicks: 0,
        createdAt: ts,
      },
    });
  });
});
test('throws error when non-duplication error has been thrown', async () => {
  const expectedCalls = [
    [Promise.reject(dynamodbDuplicateError), 'zxcvb'],
    [Promise.reject(dynamodbDuplicateError), 'asdfg'],
    [Promise.reject(new Error('internal error')), 'qwert'],
  ];

  expectedCalls.forEach(([result, id]) => {
    mockPutPromise.mockResolvedValueOnce(result);
    (deps.idGenerator as jest.Mock).mockReturnValueOnce(id);
  });

  try {
    await handler(url);
  } catch (e) {
    expect(e.message).toMatch(/internal error/i);
  }

  expect(deps.docClient.put).toBeCalledTimes(3);
  expectedCalls.forEach(([_, id], i) => {
    expect((deps.docClient.put as jest.Mock).mock.calls[i][0]).toEqual({
      ConditionExpression: `attribute_not_exists(${args.keyName})`,
      TableName: args.tableName,
      Item: {
        [args.keyName]: id,
        url,
        clicks: 0,
        createdAt: ts,
      },
    });
  });
});
