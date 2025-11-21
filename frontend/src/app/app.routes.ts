/* Rutas principales de la aplicación unificada */
import { Routes } from '@angular/router';
import { ListsComponent } from './lists/lists.component';
import { DetailComponent } from './detail/detail.component';

export const appRoutes: Routes = [
  { path: '', redirectTo: 'listas', pathMatch: 'full' },
  { path: 'listas', component: ListsComponent },
  { path: 'detalle', component: DetailComponent },
  { path: '**', redirectTo: 'listas' }
];
