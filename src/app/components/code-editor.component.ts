import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  signal
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PistonService } from '../services/piston.service';
import { CommonModule } from '@angular/common';
import { SessionService } from '../services/session.service';
import { debounceTime, Subject } from 'rxjs';
import { AuthService } from '../auth.service';

declare const monaco: any;

@Component({
  standalone: true,
  selector: 'app-code-editor',
  templateUrl: './code-editor.component.html',
  styleUrls: ['./code-editor.component.css'],
  imports: [CommonModule],
})
export class CodeEditorComponent implements AfterViewInit {
  @ViewChild('editorContainer', { static: true }) editorContainer!: ElementRef;

  codeChanges$ = new Subject<string>();
  code = signal('');
  output = signal('');
  language = signal('');
  version = signal('');
  mode = signal<'solo' | 'group'>('solo');
  kicked = signal(false);
  loading = signal(true);

  
  sessionId: string | null = null;
  isEditor = false;
  isGroupOwner = false;

  participants = signal<{ uid: string; photoURL: string | null; displayName?: string }[]>([]);
  selectedUser = signal<{ uid: string; displayName?: string } | null>(null);
  popupPosition = signal<{ x: number; y: number } | null>(null);

  private editor: any;
  private pendingRemoteCode: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private piston: PistonService,
    private sessionService: SessionService,
    private authService: AuthService
  ) {}

  ngAfterViewInit() {
    this.route.queryParamMap.subscribe(params => {
      const modeParam = (params.get('mode') as 'solo' | 'group') || 'solo';
      const sessionIdParam = params.get('sessionId');
      const lang = params.get('lang') || 'python';
      const version = params.get('version') || '3.10.0';

      this.language.set(lang);
      this.version.set(version);
      this.mode.set(modeParam);
      this.sessionId = sessionIdParam;

      const isGroup = modeParam === 'group';

      (window as any).MonacoEnvironment = {
        getWorkerUrl: function (moduleId: string, label: string) {
          return `/assets/monaco/vs/base/worker/workerMain.js`;
        }
      };
      

      window.addEventListener('beforeunload', () => {
        this.removeSelfFromParticipants();
      });

      if (isGroup && this.sessionId) {
        const currentUser = this.authService.getCurrentUser();
        const uid = currentUser?.uid || localStorage.getItem('guestId');

        if (uid) {
          this.sessionService.getSession(this.sessionId).then(session => {
            if (!session.exists()) {
              this.sessionService.createSession(this.sessionId || '', {
                code: '',
                language: lang,
                version: version,
                output: '',
                groupOwnerUid: uid,
                editorUid: uid
              });
            }
          });
        }

        this.sessionService.listenToSession(this.sessionId).subscribe(session => {
          const incomingCode = session.code ?? '';
          const currentUser = this.authService.getCurrentUser();
          const uid = currentUser?.uid || localStorage.getItem('guestId');

          if (uid && session.participants?.[uid]?.kicked) {
            console.warn('🚫 User is kicked from this session');
            this.kicked.set(true);
            return;
          }

          this.isEditor = session.editorUid === uid;
          this.isGroupOwner = session.groupOwnerUid === uid;

          const participantsData = session.participants || {};
          const list = Object.values(participantsData) as { uid: string; photoURL: string | null }[];
          this.participants.set(list);

          if (this.editor) {
            this.editor.updateOptions({
              readOnly: isGroup && !this.isEditor
            });
          }

          if (!this.editor) {
            this.pendingRemoteCode = incomingCode;
          } else {
            this.setEditorContentIfNeeded(incomingCode);
          }
          

          const currentCode = this.editor.getValue();

          if (this.isEditor && (!incomingCode || incomingCode.trim() === '')) {
            const starter = this.getStarterCode(lang);
            this.editor.setValue(starter);
            this.code.set(starter);
            this.codeChanges$.next(starter);
          } else if (!this.isEditor && incomingCode && incomingCode !== currentCode) {
            setTimeout(() => {
              if (!this.editor) return;
              this.editor.setValue(incomingCode);
              this.code.set(incomingCode);
            }, 50);
          }

          if (session.output !== undefined) {
            this.output.set(session.output);
          }
        });
      }

      this.codeChanges$.pipe(debounceTime(150)).subscribe(newCode => {
        if (this.mode() === 'group' && this.sessionId && this.isEditor) {
          this.sessionService.updateSession(this.sessionId, {
            code: newCode,
          });
        }
      });
    });

    this.loadMonaco().then(() => {
      monaco.editor.defineTheme('my-theme', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { token: 'comment', foreground: 'a9a9a9', fontStyle: 'italic' },
          { token: 'keyword', foreground: 'c586c0' },
        ],
        colors: {
          'editor.background': '#1e1e1e',
          'editorLineNumber.foreground': '#858585',
          'editorCursor.foreground': '#ffffff'
        },
      });

      monaco.editor.setTheme('my-theme');

      this.editor = monaco.editor.create(this.editorContainer.nativeElement, {
        value: '',
        language: this.mapToMonacoLang(this.language()),
        theme: 'my-theme',
        automaticLayout: true,
        fontSize: 16,
        cursorBlinking: 'expand',
        smoothScrolling: true,
        wordWrap: 'on'
      });

      if (this.mode() === 'solo') {
        const currentCode = this.editor.getValue();
        if (!currentCode || currentCode.trim() === '') {
          const starter = this.getStarterCode(this.language());
          this.editor.setValue(starter);
          this.code.set(starter);
        }
      }      

      if (this.mode() === 'group' && this.sessionId) {
        setTimeout(() => {
          const currentUser = this.authService.getCurrentUser();
          const uid = currentUser?.uid || localStorage.getItem('guestId') || '';
      
          this.sessionService.getSession(this.sessionId!).then(snapshot => {
            const session = snapshot.data();
      
            if (session?.['participants']?.[uid]?.kicked) {
              console.warn('🚫 Attempt to rejoin by kicked user:', uid);
              this.kicked.set(true);
              return;
            }
      
            // ✅ Adaugă doar dacă nu e kicked
            if (currentUser?.uid) {
              this.fetchUserPhotoURL(currentUser.uid).then(photoURL => {
                this.sessionService.addParticipant(this.sessionId!, {
                  uid: currentUser.uid,
                  photoURL,
                  displayName: currentUser.displayName || undefined
                });
              });
              
            } else {
              let guestId = localStorage.getItem('guestId');
              if (!guestId) {
                guestId = 'guest-' + Math.random().toString(36).substring(2, 9);
                localStorage.setItem('guestId', guestId);
              }
      
              let guestName = localStorage.getItem('guestName');
              if (!guestName) {
                guestName = 'Anon' + Math.floor(Math.random() * 1000);
                localStorage.setItem('guestName', guestName);
              }
      
              this.sessionService.addParticipant(this.sessionId!, {
                uid: guestId,
                photoURL: null,
                displayName: guestName
              });
            }
          });
        }, 400);
      }
      
      this.editor.updateOptions({
        readOnly: this.mode() === 'group' && !this.isEditor
      });

      if (this.pendingRemoteCode && this.mode() === 'group' && !this.isEditor) {
        this.editor.setValue(this.pendingRemoteCode);
        this.code.set(this.pendingRemoteCode);
        this.pendingRemoteCode = null;
      }

      this.editor.onDidChangeModelContent(() => {
        const newCode = this.editor.getValue();
        this.code.set(newCode);

        if (this.mode() === 'group' && this.isEditor) {
          this.codeChanges$.next(newCode);
        }
      });
    });

    document.addEventListener('click', this.handleOutsideClick);
  }

  runCode() {
    const codeToRun = this.code();
    this.output.set('⌛ Rulează...');

    this.piston.runCode({
      code: codeToRun,
      language: this.language(),
      version: this.version()
    }).subscribe({
      next: (res: any) => {
        const stdout = res?.run?.stdout?.trim();
        const stderr = res?.run?.stderr?.trim();
        const combined = [stdout, stderr].filter(Boolean).join('\n');
        this.output.set(combined || '[Fără output]');
      },
      error: err => {
        this.output.set('❌ Eroare: ' + err.message);
      }
    });
  }

  loadMonaco(): Promise<void> {
    return new Promise((resolve) => {
      if ((window as any).monaco) {
        resolve();
        return;
      }
  
      const baseUrl = '/assets/monaco';
  
      const loaderScript = document.createElement('script');
      loaderScript.src = `${baseUrl}/vs/loader.js`;
      loaderScript.onload = () => {
        (window as any).require.config({ paths: { 'vs': `${baseUrl}/vs` } });
  
        (window as any).require(['vs/editor/editor.main'], () => {
          resolve();
        });
      };
      document.body.appendChild(loaderScript);
    });
  }
  
  getStarterCode(lang: string): string {
    const templates: Record<string, string> = {
      python: `print("Salut!")`,
  
      javascript: `console.log("Salut!")`,
  
      typescript: `console.log("Salut!");`,
  
      java: `public class Main {
    public static void main(String[] args) {
      System.out.println("Salut!");
    }
  }`,
  
      c: `#include <stdio.h>
  int main() {
    printf("Salut!\\n");
    return 0;
  }`,
  
      cpp: `#include <iostream>
  int main() {
    std::cout << "Salut!" << std::endl;
    return 0;
  }`,
  
      'c++': `#include <iostream>
  int main() {
    std::cout << "Salut!" << std::endl;
    return 0;
  }`,
  
      csharp: `using System;
  
  class Program {
    static void Main(string[] args) {
      Console.WriteLine("Salut!");
    }
  }`,
  
      ruby: `puts "Salut!"`,
  
      php: `<?php
  echo "Salut!";
  ?>`,
  
      swift: `import Foundation
  
  print("Salut!")`,
  
      kotlin: `fun main() {
    println("Salut!")
  }`,
  
      rust: `fn main() {
    println!("Salut!");
  }`,
    };
  
    return templates[lang] || '';
  }
  

  mapToMonacoLang(lang: string): string {
    const map: Record<string, string> = {
      cpp: 'cpp',
      c: 'c',
      python: 'python',
      javascript: 'javascript',
      typescript: 'typescript',
      java: 'java',
    };
    return map[lang] || 'plaintext';
  }

  ngOnDestroy(): void {
    this.removeSelfFromParticipants();
    document.removeEventListener('click', this.handleOutsideClick);
  }

  removeSelfFromParticipants() {
    if (this.mode() !== 'group' || !this.sessionId) return;

    const currentUser = this.authService.getCurrentUser();
    let uid = currentUser?.uid || localStorage.getItem('guestId') || '';

    if (uid) {
      this.sessionService.removeParticipant(this.sessionId, uid).then(() => {
        console.log('👋 Removed:', uid);
      }).catch(err => {
        console.error('❌ Failed to remove participant:', err);
      });
    }
  }

  toggleUserCard(user: { uid: string; displayName?: string }, event: MouseEvent) {
    const current = this.selectedUser();
    if (current?.uid === user.uid) {
      this.selectedUser.set(null);
      this.popupPosition.set(null);
    } else {
      this.selectedUser.set(user);
      this.popupPosition.set({ x: event.clientX, y: event.clientY });
    }
  }

  async fetchUserPhotoURL(uid: string): Promise<string | null> {
    try {
      // Încearcă să iei poza din Firestore (dacă ai profiluri salvate acolo)
      const profile = await this.authService.getUserProfileFromFirestore?.(uid);
      if (profile?.photoURL) return profile.photoURL;
  
      // Dacă nu există în Firestore, încearcă din Firebase Auth
      const authURL = await this.authService.getUserProfileImage(uid);
      if (authURL) return authURL;
  
      return null; // Fallback final — SVG implicit
    } catch (err) {
      console.warn('❌ Eroare la obținerea imaginii de profil:', err);
      return null;
    }
  }
  

  makeEditor(uid: string) {
    if (!this.sessionId) return;
    const currentUser = this.authService.getCurrentUser();
    const currentUid = currentUser?.uid || localStorage.getItem('guestId') || '';

    this.sessionService.updateSession(this.sessionId, {
      editorUid: uid
    }).then(() => {
      console.log(`✍ Transferred edit rights to ${uid}`);
      this.selectedUser.set(null);
    });
  }

  makeSelfEditor() {
    if (!this.sessionId) return;
    const currentUser = this.authService.getCurrentUser();
    const uid = currentUser?.uid || localStorage.getItem('guestId') || '';

    this.sessionService.getSession(this.sessionId!).then(snapshot => {
      const session = snapshot.data();
      const uid = currentUser?.uid || localStorage.getItem('guestId');
    
      if (uid && session?.['participants']?.[uid]?.kicked) {
        console.warn('❌ User is kicked, blocking rejoin:', uid);
        alert('Ai fost eliminat din această sesiune.');
        return; // 👈 îl blocăm de la reînscriere
      }

      if (!session) return;

      const currentEditor = session['editorUid'];

      if (uid !== currentEditor) {
        this.sessionService.updateSession(this.sessionId!, {
          editorUid: uid
        }).then(() => {
          console.log(`👑 You are now the editor. Previous editor was ${currentEditor}`);
        });
      }
    });
  }

  kickUser(uid: string) {
    if (!this.sessionId) return;
  
    this.sessionService.updateSession(this.sessionId, {
      [`participants.${uid}.kicked`]: true
    }).then(() => {
      console.log(`❌ User ${uid} has been kicked and blocked from rejoining`);
      this.selectedUser.set(null);
    });
  }
  
  private setEditorContentIfNeeded(codeFromFirestore: string) {
    const currentValue = this.editor.getValue();
  
    if (!currentValue || currentValue.trim() === '') {
      this.editor.setValue(codeFromFirestore);
      this.code.set(codeFromFirestore);
      console.log('📥 Cod injectat în editor:', codeFromFirestore);
    }
  }
  

  handleOutsideClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    const clickedInsidePopup = target.closest('.user-action-card');
    const clickedAvatar = target.closest('.avatar-wrapper');

    if (!clickedInsidePopup && !clickedAvatar) {
      this.selectedUser.set(null);
      this.popupPosition.set(null);
    }
  }
}
