import { retryWhenCatch, isDuplicateError } from './utils';
import type { DocumentClient } from 'aws-sdk/clients/dynamodb';

export type Handler = (url: string) => Promise<string>;
export interface Deps {
  docClient: DocumentClient;
  idGenerator: () => string;
  ts: () => number;
}

export interface Args {
  tableName: string;
  keyName: string;
  idLength: number;
  maxRetries: number;
}

const catcher = (e: Error) => {
  throw e;
};

export const makeHandler = (
  { docClient, idGenerator, ts }: Deps,
  { tableName, keyName, maxRetries }: Args,
): Handler =>
  retryWhenCatch(
    async (url: string) => {
      const id = idGenerator();

      await docClient
        .put({
          ConditionExpression: `attribute_not_exists(${keyName})`,
          TableName: tableName,
          Item: {
            [keyName]: id,
            url,
            clicks: 0,
            createdAt: ts(),
          },
        })
        .promise();

      return id;
    },
    isDuplicateError,
    maxRetries,
    catcher,
  );
