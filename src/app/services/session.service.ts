import { Injectable } from '@angular/core';
import { Firestore, doc, setDoc, docData, updateDoc, collection, deleteField } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { getDoc } from '@angular/fire/firestore'; // dacă nu e deja


@Injectable({
  providedIn: 'root',
})
export class SessionService {
  constructor(private firestore: Firestore) {}

  getSessionDoc(sessionId: string) {
    return doc(this.firestore, `sessions/${sessionId}`);
  }

  listenToSession(sessionId: string): Observable<any> {
    const ref = this.getSessionDoc(sessionId);
    
    return docData(ref, { idField: 'id' });
  }

  updateSession(sessionId: string, data: any) {
    const sessionsCollection = collection(this.firestore, 'sessions');
    const sessionDoc = doc(sessionsCollection, sessionId);
    return updateDoc(sessionDoc, {
      ...data,
      updatedAt: Date.now()  // adăugat aici
    });
  }
  

  createSession(sessionId: string, data: any) {
    const sessionsCollection = collection(this.firestore, 'sessions');
    const sessionDoc = doc(sessionsCollection, sessionId);
    return setDoc(sessionDoc, {
      ...data,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }
  
  

  getSession(sessionId: string) {
    const ref = this.getSessionDoc(sessionId);
    return getDoc(ref);
  }

  
  addParticipant(sessionId: string, user: { uid: string; photoURL: string | null; displayName?: string }) {
    const ref = this.getSessionDoc(sessionId);
    return updateDoc(ref, {
      [`participants.${user.uid}`]: {
        ...user,
        lastActive: Date.now()
      }
    });
  }

  removeParticipant(sessionId: string, uid: string) {
    const ref = this.getSessionDoc(sessionId);
    return updateDoc(ref, {
      [`participants.${uid}`]: deleteField()
    });
  }  
  
}
