import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';




import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
<<<<<<< Updated upstream

const firebaseConfig = {
  apiKey: "AIzaSyC3eNmZkrMTTOSEZrpNaFtigFh0XMQaCgY",
  authDomain: "bitsite-9353e.firebaseapp.com",
  projectId: "bitsite-9353e",
  storageBucket: "bitsite-9353e.appspot.com",
  messagingSenderId: "584640788324",
  appId: "1:584640788324:web:ccdb994701104da9bc2c71"
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    importProvidersFrom([], provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),), provideAnimationsAsync('noop'),
  ],
=======

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideAnimationsAsync()]
>>>>>>> Stashed changes
};
