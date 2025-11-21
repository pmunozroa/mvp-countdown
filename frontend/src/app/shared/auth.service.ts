/* Servicio de autenticación usando el Hosted UI de Cognito */
import { Inject, Injectable } from '@angular/core';
import { API_CONFIG, ApiConfig } from './api-config';

const CODE_VERIFIER_KEY = 'mvp_code_verifier';
const TOKEN_KEY = 'mvp_tokens';

interface StoredTokens {
  accessToken: string;
  idToken: string;
  expiresAt: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(@Inject(API_CONFIG) private readonly config: ApiConfig) {}

  /* Inicializa el flujo comprobando si volvemos del Hosted UI */
  async handleRedirect(): Promise<void> {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (!code) {
      return;
    }
    const storedVerifier = sessionStorage.getItem(CODE_VERIFIER_KEY);
    if (!storedVerifier) {
      return;
    }
    await this.exchangeCode(code, storedVerifier);
    sessionStorage.removeItem(CODE_VERIFIER_KEY);
    const cleanedUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, cleanedUrl);
  }

  private async exchangeCode(code: string, verifier: string): Promise<void> {
    /* Intercambia el código de autorización por tokens */
    const tokenUrl = `https://${this.config.cognitoDomain}/oauth2/token`;
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: this.config.userPoolClientId,
      code,
      redirect_uri: this.config.redirectSignIn,
      code_verifier: verifier
    });
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body
    });
    if (!response.ok) {
      throw new Error('Error al intercambiar el código');
    }
    const data = await response.json();
    const expiresIn = typeof data.expires_in === 'number' ? data.expires_in : 3600;
    const tokens: StoredTokens = {
      accessToken: data.access_token,
      idToken: data.id_token,
      expiresAt: Date.now() + expiresIn * 1000
    };
    sessionStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
  }

  async login(): Promise<void> {
    /* Redirige al usuario al Hosted UI usando PKCE */
    const verifier = this.generateCodeVerifier();
    sessionStorage.setItem(CODE_VERIFIER_KEY, verifier);
    const challenge = await this.buildCodeChallenge(verifier);
    const authorizeUrl = `https://${this.config.cognitoDomain}/oauth2/authorize?response_type=code&client_id=${encodeURIComponent(this.config.userPoolClientId)}&redirect_uri=${encodeURIComponent(this.config.redirectSignIn)}&scope=${encodeURIComponent('email openid profile')}&code_challenge_method=S256&code_challenge=${challenge}`;
    window.location.assign(authorizeUrl);
  }

  logout(): void {
    /* Limpia tokens y redirige al logout del Hosted UI */
    sessionStorage.removeItem(TOKEN_KEY);
    const url = `https://${this.config.cognitoDomain}/logout?client_id=${encodeURIComponent(this.config.userPoolClientId)}&logout_uri=${encodeURIComponent(this.config.redirectSignOut)}`;
    window.location.assign(url);
  }

  getAccessToken(): string | undefined {
    /* Recupera un token válido si existe */
    const stored = sessionStorage.getItem(TOKEN_KEY);
    if (!stored) {
      return undefined;
    }
    const parsed = JSON.parse(stored) as StoredTokens;
    if (parsed.expiresAt <= Date.now()) {
      sessionStorage.removeItem(TOKEN_KEY);
      return undefined;
    }
    return parsed.accessToken;
  }

  private generateCodeVerifier(): string {
    /* Genera un code verifier basado en UUID */
    return window.crypto.randomUUID().replace(/-/g, '');
  }

  private async buildCodeChallenge(verifier: string): Promise<string> {
    /* Deriva el code challenge según PKCE */
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    const arr = Array.from(new Uint8Array(digest));
    const str = btoa(String.fromCharCode(...arr));
    return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
}
