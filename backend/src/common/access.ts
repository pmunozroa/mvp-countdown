/* Funciones de autorización para reutilizar en los controladores */
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { loadEnv } from './env';
import { getDocumentClient } from './dynamo';

export type ShareRole = 'owner' | 'editor' | 'viewer';

export interface ListAccessResult {
  role?: ShareRole;
}

export const fetchListAccess = async (userId: string, listId: string, client?: DynamoDBDocumentClient): Promise<ListAccessResult> => {
  /* Se consulta la tabla de compartidos para identificar el rol del usuario */
  const env = loadEnv();
  const ddb = client ?? getDocumentClient();
  const result = await ddb.send(new QueryCommand({
    TableName: env.listSharesTable,
    KeyConditionExpression: 'listId = :listId AND userId = :userId',
    ExpressionAttributeValues: {
      ':listId': listId,
      ':userId': userId
    },
    Limit: 1
  }));
  const item = result.Items?.[0];
  const role = typeof item?.role === 'string' ? (item.role as ShareRole) : undefined;
  return { role };
};

export const ensureAccess = (role: ShareRole | undefined, required: Array<ShareRole>): void => {
  /* Verifica que el rol esté permitido para la acción */
  if (role === undefined || !required.includes(role)) {
    const allowed = required.join(',');
    throw Object.assign(new Error('Acceso denegado'), { statusCode: 403, allowedRoles: allowed });
  }
};
