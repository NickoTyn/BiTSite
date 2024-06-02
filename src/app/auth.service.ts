import { Injectable, inject, signal } from "@angular/core";
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, user, getAuth } from "@angular/fire/auth";
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, from } from "rxjs";
import { UserInterface } from "./user.interface";

@Injectable({
    providedIn: 'root'
})

export class AuthService {
    firebaseAuth = inject(Auth);
    user$ = user(this.firebaseAuth)
    currentUserSig = signal<UserInterface | null | undefined>(undefined)

    constructor(private firestore: AngularFirestore) {}

    register(
        email: string,
        username: string,
        password: string
    ): Observable<void> {
        const promise = createUserWithEmailAndPassword(this.firebaseAuth, email, password)
            .then(response => updateProfile(response.user, { displayName: username }));

        return from(promise);
    }

    login(email: string, password: string): Observable<void> {
        const promise = signInWithEmailAndPassword(this.firebaseAuth, email, password)
            .then(() => {});

        return from(promise);
    }

    /* updateCurrentUserProfile(displayName: string, photoURL: string): Observable<void> {
        const currentUser = getAuth().currentUser;
        if (currentUser) {
            const promise = updateProfile(currentUser, {
                displayName,
                photoURL
            }).then(() => {
                // Profile updated!
            }).catch((error) => {
                // An error occurred
                console.error('Profile update failed', error);
            });

            return from(promise);
        } else {
            return from(Promise.reject('No user is currently logged in'));
        }
    } */
    

    getData(): Observable<any[]> {
        return this.firestore.collection('users').valueChanges();
      }

    logout(): Observable<void> {
        const promise = signOut(this.firebaseAuth);
        return from(promise);
    }
}
