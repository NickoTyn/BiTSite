import { Injectable } from '@angular/core';
import { Firestore, doc, setDoc, docData, updateDoc } from '@angular/fire/firestore';
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

  updateSession(sessionId: string, data: Partial<{ code: string; language: string; version: string; output: string }>) {
    const ref = this.getSessionDoc(sessionId);
    return updateDoc(ref, {
      ...data,
      updatedAt: new Date(),
    });
  }

  createSession(sessionId: string, initialData: any, ownerUid: string) {
    const ref = this.getSessionDoc(sessionId);
    return setDoc(ref, {
      ...initialData,
      ownerUid, // 👈 cine deține sesiunea
      updatedAt: Date.now(),
    });
  }  
  

  getSession(sessionId: string) {
    const ref = this.getSessionDoc(sessionId);
    return getDoc(ref);
  }
  

}
