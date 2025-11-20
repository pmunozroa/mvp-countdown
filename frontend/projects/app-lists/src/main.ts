/* Punto de arranque para la aplicación de listas */
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { API_CONFIG, ApiConfig } from '../../shared-lib/src/lib/api-config';

const envConfig: ApiConfig = (window as any).__env ?? {
  apiBaseUrl: '',
  userPoolId: '',
  userPoolClientId: '',
  cognitoDomain: '',
  redirectSignIn: window.location.origin + '/lists/',
  redirectSignOut: window.location.origin + '/lists/'
};

document.addEventListener('DOMContentLoaded', () => {
  bootstrapApplication(AppComponent, {
    providers: [
      provideHttpClient(),
      { provide: API_CONFIG, useValue: envConfig }
    ]
  }).catch(err => {
    throw err;
  });
});
