import { Injectable, inject, signal } from "@angular/core";
import { Auth, EmailAuthProvider, createUserWithEmailAndPassword, reauthenticateWithCredential, signInWithEmailAndPassword, signOut, updatePassword, updateProfile, user } from "@angular/fire/auth";
import { Observable, from } from "rxjs";
import { UserInterface } from "./user.interface";
import { initializeApp } from "firebase/app";
import { Firestore, getFirestore, setDoc, doc } from "firebase/firestore"; // Import Firestore methods
//import { AngularFirestore } from "@angular/fire/compat/firestore";


@Injectable({
    providedIn: 'root'
})

export class AuthService {
   
    firebaseAuth = inject(Auth);
    
    user$ = user(this.firebaseAuth)
    currentUserSig = signal<UserInterface | null | undefined>(undefined)
   
    //firestore = inject(AngularFirestore);
   
   /* firestore: Firestore;

    constructor() {
        const app = initializeApp({
            // Your Firebase configuration
        });
        this.firestore = getFirestore(app); // Initialize Firestore
    }*/

    register(
        email: string,
        username: string,
        password: string): Observable<void> {

        const promise = createUserWithEmailAndPassword(this.firebaseAuth, email, password
        ).then(respounse => updateProfile(respounse.user, { displayName: username }))

        return from(promise)
    }

    login(email: string, password: string): Observable<void> {
        const promise = signInWithEmailAndPassword(
            this.firebaseAuth, 
            email, 
            password
        ).then(() => {});

        return from(promise);
    }

    updateDisplayName(newDisplayName: string): Observable<void> {
        const user = this.firebaseAuth.currentUser;
        if (user) {
            const promise = updateProfile(user, { displayName: newDisplayName });
            return from(promise);
        } else {
            throw new Error("No user is currently signed in");
        }
    }

    changePassword(currentPassword: string, newPassword: string): Observable<void> {
        const user = this.firebaseAuth.currentUser;
        if (user) {
            const credential = EmailAuthProvider.credential(user.email!, currentPassword);
            const promise = reauthenticateWithCredential(user, credential).then(() => {
                return updatePassword(user, newPassword);
            });
            return from(promise);
        } else {
            throw new Error("No user is currently signed in");
        }
    }

    logout():Observable<void>{
        const promise = signOut(this.firebaseAuth);
        return from(promise);
    }
}
