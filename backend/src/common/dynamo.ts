/* Cliente compartido para DynamoDB con comentarios en español */
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

let cachedClient: DynamoDBDocumentClient | undefined;

export const getDocumentClient = (): DynamoDBDocumentClient => {
  /* Uso de singleton simple para reutilizar conexiones */
  if (cachedClient === undefined) {
    const client = new DynamoDBClient({});
    cachedClient = DynamoDBDocumentClient.from(client, {
      marshallOptions: { removeUndefinedValues: true }
    });
  }
  return cachedClient;
};
