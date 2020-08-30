import type { AWSError } from 'aws-sdk';

export const isDuplicateError = (err: Error): boolean =>
  err instanceof Error &&
  (err as AWSError).code === 'ConditionalCheckFailedException' &&
  err.message.includes('The conditional request failed');

export const retryWhenCatch = <T>(
  tryer: (...args: any[]) => Promise<T>,
  shouldRetry: (err: Error, ...args: any[]) => boolean,
  retries: number,
  catcher: (err: Error, ...args: any[]) => any,
) => async (...args: any[]) => {
  let lastErr = null;
  let _retries = retries;

  while (_retries--) {
    try {
      return await tryer(...args);
    } catch (err) {
      lastErr = err;
      if (shouldRetry(err, ...args) === false) {
        break;
      }
    }
  }

  return catcher(lastErr, ...args);
};
