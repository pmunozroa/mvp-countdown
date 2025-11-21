/* Punto de arranque para la aplicación unificada */
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { appRoutes } from './app/app.routes';
import { API_CONFIG, ApiConfig } from './app/shared';

const envConfig: ApiConfig = (window as any).__env ?? {
  apiBaseUrl: '',
  userPoolId: '',
  userPoolClientId: '',
  cognitoDomain: '',
  redirectSignIn: window.location.origin + '/',
  redirectSignOut: window.location.origin + '/'
};

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    provideRouter(appRoutes),
    { provide: API_CONFIG, useValue: envConfig }
  ]
}).catch(err => {
  throw err;
});
