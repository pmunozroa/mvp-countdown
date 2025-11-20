/* Trigger de confirmación de Cognito para poblar datos iniciales */
import { PutCommand, QueryCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { loadEnv } from '../../common/env';
import { getDocumentClient } from '../../common/dynamo';

interface CognitoEvent {
  request: {
    userAttributes: Record<string, string | undefined>;
  };
}

export const handler = async (event: CognitoEvent): Promise<CognitoEvent> => {
  const env = loadEnv();
  const ddb = getDocumentClient();
  const attributes = event.request.userAttributes;
  const userId = attributes.sub;
  const email = attributes.email;
  if (!userId) {
    throw new Error('Usuario sin sub');
  }
  if (!email) {
    throw new Error('Usuario sin email');
  }

  await ddb.send(new PutCommand({
    TableName: env.usersTable,
    Item: {
      userId,
      email: email.toLowerCase(),
      createdAt: new Date().toISOString()
    }
  }));

  const invites = await ddb.send(new QueryCommand({
    TableName: env.invitesTable,
    KeyConditionExpression: 'email = :email',
    ExpressionAttributeValues: {
      ':email': email.toLowerCase()
    }
  }));

  const inviteItems = invites.Items ?? [];
  for (const invite of inviteItems) {
    if (typeof invite.listId !== 'string') {
      continue;
    }
    await ddb.send(new PutCommand({
      TableName: env.listSharesTable,
      Item: {
        listId: invite.listId,
        userId,
        role: invite.role ?? 'viewer'
      }
    }));
    await ddb.send(new DeleteCommand({
      TableName: env.invitesTable,
      Key: {
        email: email.toLowerCase(),
        listId: invite.listId
      }
    }));
  }

  return event;
};
