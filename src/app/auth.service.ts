import { Injectable, inject, signal } from "@angular/core";
import { Auth, EmailAuthProvider, User, createUserWithEmailAndPassword, reauthenticateWithCredential, signInWithEmailAndPassword, signOut, updatePassword, updateProfile, user } from "@angular/fire/auth";
import { Observable, from, throwError } from "rxjs";
import { UserInterface } from "./user.interface";
import { getApp } from "firebase/app";
import { Firestore, getFirestore, setDoc, getDoc, doc } from "firebase/firestore"; // Import Firestore methods
//import { AngularFirestore } from "@angular/fire/compat/firestore";


@Injectable({
    providedIn: 'root'
})

export class AuthService {
   
    firebaseAuth = inject(Auth);
    
    user$ = user(this.firebaseAuth)
    currentUserSig = signal<UserInterface | null | undefined>(undefined)

    private currentUserRank: string | null = null;
  

    //firestore = inject(AngularFirestore);
   
   firestore: Firestore;

    constructor(private auth: Auth) {
        this.firestore = getFirestore(getApp());
        this.loadUserRankFromLocalStorage();
        this.checkAuthState();
    }


    private saveUserRankToLocalStorage(rank: string): void {
        localStorage.setItem('userRank', rank);
      }
    
      private loadUserRankFromLocalStorage(): void {
        const rank = localStorage.getItem('userRank');
        if (rank) {
          this.currentUserRank = rank;
        }
      }
    
      private clearUserRankFromLocalStorage(): void {
        localStorage.removeItem('userRank');
      }
    
      getCurrentUser(): User | null {
        return this.auth.currentUser;
      }

      getUserRank(): string | null {
        return this.currentUserRank;
      }
    
      register(email: string, username: string, password: string): Observable<void> {
        const promise = createUserWithEmailAndPassword(this.firebaseAuth, email, password)
          .then(async response => {
            await updateProfile(response.user, { displayName: username });
            await this.setUserRank(response.user.uid, 'defaultRank'); // Set default rank on registration
          })
          .catch(this.handleError);
    
        return from(promise);
      }
    
      login(email: string, password: string): Observable<void> {
        const promise = signInWithEmailAndPassword(this.firebaseAuth, email, password)
          .then(response => this.fetchUserRank(response.user))
          .catch(this.handleError);
    
        return from(promise);
      }
    
      private async fetchUserRank(user: User): Promise<void> {
        const userDocRef = doc(this.firestore, `users/${user.uid}`);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const rank = userDoc.data()["rank"];
          this.currentUserRank = rank;
          this.saveUserRankToLocalStorage(rank);
        }
      }
    
      updateDisplayName(newDisplayName: string): Observable<void> {
        const user = this.firebaseAuth.currentUser;
        if (user) {
          const promise = updateProfile(user, { displayName: newDisplayName })
            .catch(this.handleError);
          return from(promise);
        } else {
          return throwError(() => new Error("No user is currently signed in"));
        }
      }
    
      changePassword(currentPassword: string, newPassword: string): Observable<void> {
        const user = this.firebaseAuth.currentUser;
        if (user) {
          const credential = EmailAuthProvider.credential(user.email!, currentPassword);
          const promise = reauthenticateWithCredential(user, credential)
            .then(() => updatePassword(user, newPassword))
            .catch(this.handleError);
          return from(promise);
        } else {
          return throwError(() => new Error("No user is currently signed in"));
        }
      }
    
      logout(): Observable<void> {
        const promise = signOut(this.firebaseAuth)
          .then(() => {
            this.currentUserRank = null;
            this.clearUserRankFromLocalStorage();
          })
          .catch(this.handleError);
        return from(promise);
      }
    
      private async setUserRank(uid: string, rank: string): Promise<void> {
        const userDocRef = doc(this.firestore, `users/${uid}`);
        await setDoc(userDocRef, { rank }, { merge: true });
        this.currentUserRank = rank;
        this.saveUserRankToLocalStorage(rank);
      }
    
      updateUserRank(rank: string): Observable<void> {
        const user = this.firebaseAuth.currentUser;
        if (user) {
          const promise = this.setUserRank(user.uid, rank)
            .catch(this.handleError);
          return from(promise);
        } else {
          return throwError(() => new Error("No user is currently signed in"));
        }
      }
    
      private handleError(error: any): Promise<any> {
        console.error('An error occurred', error);
        return Promise.reject(error.message || error);
      }

      private checkAuthState(): void {
        const user = this.firebaseAuth.currentUser;
        if (user) {
            // User is signed in
            this.currentUserSig.set({ 
                email: user.email || '',
                username: user.displayName || ''
            });
        } else {
            // User is signed out
            this.currentUserSig.set(null);
        }
    }

    isUserSignedIn(): boolean {
        return this.firebaseAuth.currentUser !== null;
    }

    }