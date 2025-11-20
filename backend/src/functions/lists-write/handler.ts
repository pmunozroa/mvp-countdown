/* Lambda para crear listas nuevas */
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { jsonResponse, HttpEvent, HttpResponse, parseBody } from '../../common/api';
import { getUserIdentity } from '../../common/auth';
import { loadEnv } from '../../common/env';
import { getDocumentClient } from '../../common/dynamo';

const bodySchema = z.object({
  name: z.string().min(1).max(120)
});

export const handler = async (event: HttpEvent): Promise<HttpResponse> => {
  const identity = getUserIdentity(event);
  const env = loadEnv();
  const ddb = getDocumentClient();
  const body = parseBody(event.body, bodySchema);
  const listId = randomUUID();
  const now = new Date().toISOString();

  await ddb.send(new TransactWriteCommand({
    TransactItems: [
      {
        Put: {
          TableName: env.listsTable,
          Item: {
            listId,
            name: body.name,
            ownerUserId: identity.userId,
            createdAt: now
          },
          ConditionExpression: 'attribute_not_exists(listId)'
        }
      },
      {
        Put: {
          TableName: env.listSharesTable,
          Item: {
            listId,
            userId: identity.userId,
            role: 'owner'
          },
          ConditionExpression: 'attribute_not_exists(listId) AND attribute_not_exists(userId)'
        }
      }
    ]
  }));

  return jsonResponse(201, { listId, name: body.name });
};
