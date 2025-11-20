/* Lambda para listar MVPs paginados */
import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import { jsonResponse, HttpEvent, HttpResponse } from '../../common/api';
import { loadEnv } from '../../common/env';
import { getDocumentClient } from '../../common/dynamo';

const decodeToken = (token: string | undefined): Record<string, unknown> | undefined => {
  /* Decodifica un token base64 JSON de paginación */
  if (token === undefined) {
    return undefined;
  }
  const json = Buffer.from(token, 'base64').toString('utf-8');
  return JSON.parse(json);
};

const encodeToken = (key: Record<string, unknown> | undefined): string | undefined => {
  /* Serializa la clave de continuación en base64 */
  if (key === undefined) {
    return undefined;
  }
  const json = JSON.stringify(key);
  return Buffer.from(json, 'utf-8').toString('base64');
};

export const handler = async (event: HttpEvent): Promise<HttpResponse> => {
  const env = loadEnv();
  const ddb = getDocumentClient();
  const limitParam = event.queryStringParameters?.limit;
  const limit = limitParam !== undefined ? Math.max(1, Math.min(50, Number.parseInt(limitParam, 10))) : 20;
  const startKey = decodeToken(event.queryStringParameters?.nextToken);

  const result = await ddb.send(new ScanCommand({
    TableName: env.mvpsTable,
    Limit: limit,
    ExclusiveStartKey: startKey as any
  }));

  return jsonResponse(200, {
    items: result.Items ?? [],
    nextToken: encodeToken(result.LastEvaluatedKey as any)
  });
};
