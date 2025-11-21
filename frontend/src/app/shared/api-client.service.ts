/* Cliente HTTP para interactuar con la API */
import { Inject, Injectable } from '@angular/core';
import { API_CONFIG, ApiConfig } from './api-config';
import { AuthService } from './auth.service';
import { ListSummary, TimerItem, MvpItem, ShareRequest } from './models';

@Injectable({ providedIn: 'root' })
export class ApiClientService {
  constructor(
    @Inject(API_CONFIG) private readonly config: ApiConfig,
    private readonly auth: AuthService
  ) {}

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    /* Hace peticiones autenticadas a la API */
    const token = this.auth.getAccessToken();
    if (!token) {
      throw new Error('Usuario no autenticado');
    }
    const response = await fetch(`${this.config.apiBaseUrl}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(init?.headers ?? {})
      }
    });
    if (!response.ok) {
      throw new Error(`Error ${response.status}`);
    }
    return response.json() as Promise<T>;
  }

  async getLists(): Promise<ListSummary[]> {
    /* Recupera listas visibles */
    const data = await this.request<{ lists: ListSummary[] }>('/lists');
    return data.lists;
  }

  async createList(name: string): Promise<ListSummary> {
    /* Crea una nueva lista */
    const data = await this.request<{ listId: string; name: string }>('/lists', {
      method: 'POST',
      body: JSON.stringify({ name })
    });
    return { listId: data.listId, name: data.name, role: 'owner' };
  }

  async shareList(listId: string, payload: ShareRequest): Promise<void> {
    /* Comparte una lista con otro usuario */
    await this.request(`/lists/${listId}/share`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async getTimers(listId: string): Promise<TimerItem[]> {
    /* Obtiene timers de una lista */
    const data = await this.request<{ items: TimerItem[] }>(`/lists/${listId}/timers`);
    return data.items;
  }

  async markDeath(listId: string, mvpId: string, lastDeathAtMs: number): Promise<TimerItem> {
    /* Registra la muerte de un MVP */
    const data = await this.request<{ timer: TimerItem }>(`/lists/${listId}/timers/${mvpId}/mark-death`, {
      method: 'POST',
      body: JSON.stringify({ lastDeathAtMs })
    });
    return data.timer;
  }

  async getMvpCatalog(limit = 20, nextToken?: string): Promise<{ items: MvpItem[]; nextToken?: string }> {
    /* Recupera la lista de MVPs */
    const params = new URLSearchParams({ limit: limit.toString() });
    if (nextToken) {
      params.set('nextToken', nextToken);
    }
    return this.request(`/mvps?${params.toString()}`);
  }
}
