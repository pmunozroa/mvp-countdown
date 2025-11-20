/* Lambda para obtener listas visibles por el usuario */
import { BatchGetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { jsonResponse, HttpEvent, HttpResponse } from '../../common/api';
import { getUserIdentity } from '../../common/auth';
import { loadEnv } from '../../common/env';
import { getDocumentClient } from '../../common/dynamo';

export const handler = async (event: HttpEvent): Promise<HttpResponse> => {
  const identity = getUserIdentity(event);
  const env = loadEnv();
  const ddb = getDocumentClient();

  const owned = await ddb.send(new QueryCommand({
    TableName: env.listsTable,
    IndexName: env.ownerIndexName,
    KeyConditionExpression: 'ownerUserId = :owner',
    ExpressionAttributeValues: {
      ':owner': identity.userId
    }
  }));
  const ownedItems = owned.Items ?? [];

  const shared = await ddb.send(new QueryCommand({
    TableName: env.listSharesTable,
    IndexName: env.sharedWithIndexName,
    KeyConditionExpression: 'userId = :user',
    ExpressionAttributeValues: {
      ':user': identity.userId
    }
  }));
  const sharedItems = shared.Items ?? [];

  const sharedListIds = new Set<string>();
  for (const item of sharedItems) {
    if (typeof item.listId === 'string') {
      sharedListIds.add(item.listId);
    }
  }
  for (const ownedItem of ownedItems) {
    if (typeof ownedItem.listId === 'string') {
      sharedListIds.delete(ownedItem.listId);
    }
  }

  const sharedDetails: Array<Record<string, unknown>> = [];
  if (sharedListIds.size > 0) {
    const batch = await ddb.send(new BatchGetCommand({
      RequestItems: {
        [env.listsTable]: {
          Keys: Array.from(sharedListIds).map(listId => ({ listId }))
        }
      }
    }));
    const responses = batch.Responses?.[env.listsTable] ?? [];
    for (const item of responses) {
      sharedDetails.push(item);
    }
  }

  const lists = [
    ...ownedItems.map(item => ({
      listId: item.listId,
      name: item.name,
      role: 'owner'
    })),
    ...sharedItems
      .filter(item => typeof item.listId === 'string' && item.role !== 'owner')
      .map(item => ({
        listId: item.listId,
        role: item.role,
        name: sharedDetails.find(detail => detail.listId === item.listId)?.name ?? null
      }))
  ];

  return jsonResponse(200, { lists });
};
