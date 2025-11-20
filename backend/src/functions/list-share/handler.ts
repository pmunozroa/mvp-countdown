/* Lambda para compartir listas con otros usuarios */
import { z } from 'zod';
import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { jsonResponse, HttpEvent, HttpResponse, parseBody } from '../../common/api';
import { getUserIdentity } from '../../common/auth';
import { loadEnv } from '../../common/env';
import { getDocumentClient } from '../../common/dynamo';
import { ensureAccess, fetchListAccess, ShareRole } from '../../common/access';

const bodySchema = z.object({
  email: z.string().email(),
  role: z.enum(['editor', 'viewer', 'owner']).default('viewer')
});

export const handler = async (event: HttpEvent): Promise<HttpResponse> => {
  const listId = event.pathParameters?.listId;
  if (typeof listId !== 'string' || listId.length === 0) {
    return jsonResponse(400, { message: 'listId inválido' });
  }
  const identity = getUserIdentity(event);
  const env = loadEnv();
  const ddb = getDocumentClient();
  const body = parseBody(event.body, bodySchema);

  const access = await fetchListAccess(identity.userId, listId, ddb);
  ensureAccess(access.role, ['owner']);

  const userQuery = await ddb.send(new QueryCommand({
    TableName: env.usersTable,
    IndexName: env.userEmailIndexName,
    KeyConditionExpression: 'email = :email',
    ExpressionAttributeValues: {
      ':email': body.email.toLowerCase()
    },
    Limit: 1
  }));

  const existingUser = userQuery.Items?.[0];

  if (existingUser?.userId) {
    await ddb.send(new PutCommand({
      TableName: env.listSharesTable,
      Item: {
        listId,
        userId: existingUser.userId,
        role: body.role as ShareRole
      }
    }));
    return jsonResponse(200, { status: 'shared' });
  }

  await ddb.send(new PutCommand({
    TableName: env.invitesTable,
    Item: {
      email: body.email.toLowerCase(),
      listId,
      role: body.role as ShareRole,
      createdAt: Date.now()
    }
  }));

  return jsonResponse(202, { status: 'invited' });
};
