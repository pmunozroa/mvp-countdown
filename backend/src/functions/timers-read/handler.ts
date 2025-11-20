/* Lambda para consultar timers de una lista */
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { jsonResponse, HttpEvent, HttpResponse } from '../../common/api';
import { getUserIdentity } from '../../common/auth';
import { loadEnv } from '../../common/env';
import { getDocumentClient } from '../../common/dynamo';
import { ensureAccess, fetchListAccess } from '../../common/access';

export const handler = async (event: HttpEvent): Promise<HttpResponse> => {
  const listId = event.pathParameters?.listId;
  if (typeof listId !== 'string' || listId.length === 0) {
    return jsonResponse(400, { message: 'listId inválido' });
  }
  const identity = getUserIdentity(event);
  const env = loadEnv();
  const ddb = getDocumentClient();

  const access = await fetchListAccess(identity.userId, listId, ddb);
  ensureAccess(access.role, ['owner', 'editor', 'viewer']);

  const timers = await ddb.send(new QueryCommand({
    TableName: env.timersTable,
    KeyConditionExpression: 'listId = :listId',
    ExpressionAttributeValues: {
      ':listId': listId
    }
  }));

  return jsonResponse(200, { items: timers.Items ?? [] });
};
