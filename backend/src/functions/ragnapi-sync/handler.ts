/* Lambda para sincronizar el catálogo desde RagnaPI */
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { jsonResponse, HttpEvent, HttpResponse } from '../../common/api';
import { loadEnv } from '../../common/env';
import { getDocumentClient } from '../../common/dynamo';

interface RagnaPiMvp {
  id: string;
  name: string;
  map: string;
  minRespawn: number;
  maxRespawn: number;
}

const userIsAdmin = (event: HttpEvent): boolean => {
  /* Evalúa si el usuario pertenece al grupo admin de Cognito */
  const rawGroups = event.requestContext?.authorizer?.jwt?.claims?.['cognito:groups'];
  if (Array.isArray(rawGroups)) {
    return rawGroups.includes('admin');
  }
  if (typeof rawGroups === 'string') {
    return rawGroups.split(',').includes('admin');
  }
  return false;
};

export const handler = async (event: HttpEvent): Promise<HttpResponse> => {
  if (!userIsAdmin(event)) {
    return jsonResponse(403, { message: 'Solo administradores' });
  }
  const env = loadEnv();
  const ddb = getDocumentClient();

  const response = await fetch(env.ragnaPiBaseUrl, {
    headers: { Accept: 'application/json' }
  });
  if (!response.ok) {
    return jsonResponse(502, { message: 'Error al consultar RagnaPI' });
  }
  const data = (await response.json()) as RagnaPiMvp[];

  for (const item of data) {
    if (!item?.id) {
      continue;
    }
    await ddb.send(new PutCommand({
      TableName: env.mvpsTable,
      Item: {
        mvpId: item.id,
        name: item.name,
        map: item.map,
        minRespawn: item.minRespawn,
        maxRespawn: item.maxRespawn,
        updatedAt: Date.now()
      }
    }));
  }

  return jsonResponse(200, { count: data.length });
};
