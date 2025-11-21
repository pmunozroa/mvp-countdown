/* Archivo de utilidades de entorno en español */
export interface EnvConfig {
  usersTable: string;
  listsTable: string;
  listSharesTable: string;
  timersTable: string;
  mvpsTable: string;
  invitesTable: string;
  ownerIndexName: string;
  sharedWithIndexName: string;
  userEmailIndexName: string;
  ragnaPiBaseUrl: string;
}

export const loadEnv = (): EnvConfig => {
  /* Validación básica de variables de entorno para evitar errores en ejecución */
  const required = {
    usersTable: process.env.USERS_TABLE,
    listsTable: process.env.LISTS_TABLE,
    listSharesTable: process.env.LIST_SHARES_TABLE,
    timersTable: process.env.TIMERS_TABLE,
    mvpsTable: process.env.MVPS_TABLE,
    invitesTable: process.env.INVITES_TABLE,
    ownerIndexName: process.env.LISTS_OWNER_INDEX ?? 'ownerUserId-index',
    sharedWithIndexName: process.env.LIST_SHARES_USER_INDEX ?? 'userId-index',
    userEmailIndexName: process.env.USERS_EMAIL_INDEX ?? 'email-index',
    ragnaPiBaseUrl: process.env.RAGNA_PI_BASE_URL ?? 'https://api.ragnapi.com/mvps'
  } as const;

  for (const [key, value] of Object.entries(required)) {
    if (value === undefined || value === '') {
      throw new Error(`Falta variable de entorno requerida: ${key}`);
    }
  }

  const config: EnvConfig = {
    usersTable: required.usersTable!,
    listsTable: required.listsTable!,
    listSharesTable: required.listSharesTable!,
    timersTable: required.timersTable!,
    mvpsTable: required.mvpsTable!,
    invitesTable: required.invitesTable!,
    ownerIndexName: required.ownerIndexName!,
    sharedWithIndexName: required.sharedWithIndexName!,
    userEmailIndexName: required.userEmailIndexName!,
    ragnaPiBaseUrl: required.ragnaPiBaseUrl!
  };
  return config;
};
