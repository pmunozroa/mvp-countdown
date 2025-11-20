/* Componente principal para administrar listas */
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiClientService, AuthService, ListSummary, ShareRequest } from '../../../shared-lib/src/public-api';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  /* Estados de la vista */
  readonly lists = signal<ListSummary[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  newListName = '';
  shareEmail = '';
  shareRole: ShareRequest['role'] = 'viewer';
  selectedList: string | null = null;

  constructor(private readonly api: ApiClientService, private readonly auth: AuthService) {
    /* Se carga información inicial si el usuario ya dispone de token */
    if (this.auth.getAccessToken()) {
      void this.loadLists();
    }
    void this.auth.handleRedirect().then(() => {
      if (!this.auth.getAccessToken()) {
        return;
      }
      void this.loadLists();
    });
  }

  async login(): Promise<void> {
    /* Dispara el flujo de autenticación */
    await this.auth.login();
  }

  logout(): void {
    /* Cierra la sesión del usuario */
    this.auth.logout();
  }

  async loadLists(): Promise<void> {
    /* Carga listas desde la API */
    this.loading.set(true);
    this.error.set(null);
    try {
      const data = await this.api.getLists();
      this.lists.set(data);
    } catch (err) {
      this.error.set((err as Error).message);
    } finally {
      this.loading.set(false);
    }
  }

  async createList(): Promise<void> {
    /* Crea una lista nueva usando el servicio */
    if (!this.newListName) {
      return;
    }
    try {
      const created = await this.api.createList(this.newListName);
      this.lists.set([...this.lists(), created]);
      this.newListName = '';
    } catch (err) {
      this.error.set((err as Error).message);
    }
  }

  async share(): Promise<void> {
    /* Comparte la lista seleccionada */
    if (!this.selectedList || !this.shareEmail) {
      return;
    }
    try {
      await this.api.shareList(this.selectedList, { email: this.shareEmail, role: this.shareRole });
      this.shareEmail = '';
      this.shareRole = 'viewer';
    } catch (err) {
      this.error.set((err as Error).message);
    }
  }
}
