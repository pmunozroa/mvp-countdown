/* Lambda para registrar la muerte de un MVP */
import { z } from 'zod';
import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { jsonResponse, HttpEvent, HttpResponse, parseBody } from '../../common/api';
import { getUserIdentity } from '../../common/auth';
import { loadEnv } from '../../common/env';
import { getDocumentClient } from '../../common/dynamo';
import { ensureAccess, fetchListAccess } from '../../common/access';
import { calculateTimerWindow } from '../../common/timers';

const bodySchema = z.object({
  lastDeathAtMs: z.number().int().nonnegative()
});

export const handler = async (event: HttpEvent): Promise<HttpResponse> => {
  const listId = event.pathParameters?.listId;
  const mvpId = event.pathParameters?.mvpId;
  if (typeof listId !== 'string' || typeof mvpId !== 'string') {
    return jsonResponse(400, { message: 'Parámetros inválidos' });
  }
  const body = parseBody(event.body, bodySchema);
  const identity = getUserIdentity(event);
  const env = loadEnv();
  const ddb = getDocumentClient();

  const access = await fetchListAccess(identity.userId, listId, ddb);
  ensureAccess(access.role, ['owner', 'editor']);

  const mvpResult = await ddb.send(new GetCommand({
    TableName: env.mvpsTable,
    Key: { mvpId }
  }));
  const mvp = mvpResult.Item;
  if (mvp === undefined) {
    return jsonResponse(404, { message: 'MVP no encontrado' });
  }
  const min = typeof mvp.minRespawn === 'number' ? mvp.minRespawn : mvp.minRespawn?.minutes ?? mvp.minRespawn;
  const max = typeof mvp.maxRespawn === 'number' ? mvp.maxRespawn : mvp.maxRespawn?.minutes ?? mvp.maxRespawn;
  if (typeof min !== 'number' || typeof max !== 'number') {
    return jsonResponse(500, { message: 'Configuración de MVP inválida' });
  }

  const window = calculateTimerWindow({
    lastDeathAt: body.lastDeathAtMs,
    minRespawnMinutes: min,
    maxRespawnMinutes: max
  }, Date.now());

  await ddb.send(new PutCommand({
    TableName: env.timersTable,
    Item: {
      listId,
      mvpId,
      lastDeathAt: body.lastDeathAtMs,
      spawnStart: window.spawnStart,
      spawnEnd: window.spawnEnd,
      status: window.status,
      ttl: window.ttlSeconds,
      updatedBy: identity.userId,
      updatedAt: Date.now()
    }
  }));

  return jsonResponse(200, { timer: {
    listId,
    mvpId,
    lastDeathAt: body.lastDeathAtMs,
    spawnStart: window.spawnStart,
    spawnEnd: window.spawnEnd,
    status: window.status,
    ttl: window.ttlSeconds
  } });
};
