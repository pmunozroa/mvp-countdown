/* Punto de arranque para la aplicación de detalle */
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { DetailComponent } from './app/detail.component';
import { API_CONFIG, ApiConfig } from '../../shared-lib/src/lib/api-config';

const envConfig: ApiConfig = (window as any).__env ?? {
  apiBaseUrl: '',
  userPoolId: '',
  userPoolClientId: '',
  cognitoDomain: '',
  redirectSignIn: window.location.origin + '/detail/',
  redirectSignOut: window.location.origin + '/detail/'
};

document.addEventListener('DOMContentLoaded', () => {
  bootstrapApplication(DetailComponent, {
    providers: [
      provideHttpClient(),
      { provide: API_CONFIG, useValue: envConfig }
    ]
  }).catch(err => {
    throw err;
  });
});
