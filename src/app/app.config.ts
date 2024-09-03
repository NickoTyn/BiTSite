import { ApplicationConfig, importProvidersFrom,EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { provideAuth, getAuth,/*  GoogleAuthProvider */ } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { provideFunctions, getFunctions } from '@angular/fire/functions';




import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const firebaseConfig = {
  apiKey: "AIzaSyC3eNmZkrMTTOSEZrpNaFtigFh0XMQaCgY",
  authDomain: "bitsite-9353e.firebaseapp.com",
  projectId: "bitsite-9353e",
  storageBucket: "bitsite-9353e.appspot.com",
  messagingSenderId: "584640788324",
  appId: "1:584640788324:web:ccdb994701104da9bc2c71"
};

/* const provider = new GoogleAuthProvider(); */

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
    provideFunctions(() => getFunctions()),
    provideAnimationsAsync('noop'),
  ],
};
