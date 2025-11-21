/* Tokens de configuración para compartir dentro de la aplicación */
import { InjectionToken } from '@angular/core';

export interface ApiConfig {
  apiBaseUrl: string;
  userPoolId: string;
  userPoolClientId: string;
  cognitoDomain: string;
  redirectSignIn: string;
  redirectSignOut: string;
}

export const API_CONFIG = new InjectionToken<ApiConfig>('API_CONFIG');
