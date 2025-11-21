/* Componente para gestionar timers de una lista concreta dentro de la aplicación unificada */
import { Component, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiClientService, AuthService, TimerItem, MvpItem } from '../shared';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss'
})
export class DetailComponent implements OnDestroy {
  /* Estado local de la pantalla */
  readonly timers = signal<TimerItem[]>([]);
  readonly mvps = signal<MvpItem[]>([]);
  readonly error = signal<string | null>(null);
  readonly loading = signal(false);
  selectedMvp: string | null = null;
  lastDeathAt: number = Date.now();
  private listId: string | null;
  private pollHandle: ReturnType<typeof setInterval> | null = null;

  constructor(private readonly api: ApiClientService, private readonly auth: AuthService) {
    const params = new URLSearchParams(window.location.search);
    this.listId = params.get('listId');
    if (this.auth.getAccessToken()) {
      void this.initData();
    }
    void this.auth.handleRedirect().then(() => {
      if (!this.auth.getAccessToken()) {
        return;
      }
      void this.initData();
    });
  }

  ngOnDestroy(): void {
    /* Limpia el intervalo de refresco */
    if (this.pollHandle) {
      clearInterval(this.pollHandle);
    }
  }

  async login(): Promise<void> {
    /* Redirige al Hosted UI */
    await this.auth.login();
  }

  logout(): void {
    /* Cierra sesión */
    this.auth.logout();
  }

  async initData(): Promise<void> {
    /* Carga timers y MVPs iniciales */
    if (!this.listId) {
      this.error.set('Falta listId');
      return;
    }
    await Promise.all([this.loadTimers(), this.loadMvpCatalog()]);
    this.startPolling();
  }

  private startPolling(): void {
    /* Configura el polling periódico */
    if (this.pollHandle) {
      clearInterval(this.pollHandle);
    }
    this.pollHandle = setInterval(() => {
      void this.loadTimers();
    }, 12_000);
  }

  async loadTimers(): Promise<void> {
    /* Recupera timers del backend */
    if (!this.listId) {
      return;
    }
    this.loading.set(true);
    try {
      const data = await this.api.getTimers(this.listId);
      this.timers.set(data);
    } catch (err) {
      this.error.set((err as Error).message);
    } finally {
      this.loading.set(false);
    }
  }

  async loadMvpCatalog(): Promise<void> {
    /* Consulta el catálogo de MVPs */
    try {
      const data = await this.api.getMvpCatalog(50);
      this.mvps.set(data.items);
    } catch (err) {
      this.error.set((err as Error).message);
    }
  }

  async markDeath(): Promise<void> {
    /* Marca la muerte del MVP seleccionado */
    if (!this.listId || !this.selectedMvp) {
      return;
    }
    try {
      await this.api.markDeath(this.listId, this.selectedMvp, this.lastDeathAt);
      await this.loadTimers();
    } catch (err) {
      this.error.set((err as Error).message);
    }
  }
}
