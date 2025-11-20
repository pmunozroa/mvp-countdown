/* Tipos mínimos para eventos HTTP API */
export interface HttpEvent {
  requestContext?: {
    authorizer?: {
      jwt?: {
        claims?: Record<string, unknown>;
      };
    };
  };
  pathParameters?: Record<string, string | undefined>;
  queryStringParameters?: Record<string, string | undefined>;
  body?: string | null;
}

export interface HttpResponse {
  statusCode: number;
  body: string;
  headers?: Record<string, string>;
}

export const jsonResponse = (statusCode: number, payload: unknown): HttpResponse => {
  /* Serialización consistente en JSON */
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  };
};

export const parseBody = <T>(body: string | null | undefined, schema: { parse: (input: unknown) => T }): T => {
  /* Se valida el cuerpo con ayuda de zod */
  const parsed = body === undefined || body === null || body.length === 0 ? {} : JSON.parse(body);
  return schema.parse(parsed);
};
