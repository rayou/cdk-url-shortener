import * as crypto from 'crypto';
import { Table, CfnTable } from '@aws-cdk/aws-dynamodb';

export const hash = (code: string): string =>
  crypto.createHash('md5').update(code).digest('hex').substr(0, 6);

export const getKeySchemaProperty = (
  table: Table,
  keyType: string,
): CfnTable.KeySchemaProperty => {
  const cfnTable = table.node.defaultChild as CfnTable;
  const keySchemas = cfnTable.keySchema as CfnTable.KeySchemaProperty[];
  const partitionKeyAttribute = keySchemas.find(
    (keySchema) => keySchema.keyType === keyType,
  );
  if (partitionKeyAttribute === undefined) {
    throw new Error('PartitionKey is not set');
  }
  return partitionKeyAttribute;
};
