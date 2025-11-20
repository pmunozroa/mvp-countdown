/* Extracción de identidad desde JWT para mantener coherencia */
export interface UserIdentity {
  userId: string;
  email?: string;
}

interface JwtAuthorizerContext {
  claims?: Record<string, unknown>;
}

export const getUserIdentity = (event: { requestContext?: { authorizer?: { jwt?: JwtAuthorizerContext } } }): UserIdentity => {
  /* Se extraen los campos básicos del token de Cognito */
  const claims = event.requestContext?.authorizer?.jwt?.claims ?? {};
  const sub = claims.sub;
  if (typeof sub !== 'string' || sub.length === 0) {
    throw new Error('Token sin sub válido');
  }
  const emailClaim = claims.email;
  return {
    userId: sub,
    email: typeof emailClaim === 'string' ? emailClaim : undefined
  };
};
