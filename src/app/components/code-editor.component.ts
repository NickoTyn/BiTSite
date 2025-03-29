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
  sessionId: string | null = null;
  isOwner = false;

  participants = signal<{ uid: string; photoURL: string | null }[]>([]);

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

      if (isGroup && this.sessionId) {
        const currentUser = this.authService.getCurrentUser();
        const uid = currentUser?.uid;

        // Creează sesiunea dacă e owner
        if (uid) {
          this.sessionService.getSession(this.sessionId).then(session => {
            if (!session.exists()) {
              this.sessionService.createSession(this.sessionId || '', {
                code: '',
                language: lang,
                version: version,
                output: '',
                ownerUid: uid
              });
            }
          });
        }


        // Pornim mereu listener-ul, indiferent dacă e viewer sau owner
        this.sessionService.listenToSession(this.sessionId).subscribe(session => {
          const incomingCode = session.code ?? '';
          const currentUser = this.authService.getCurrentUser();
          const uid = currentUser?.uid;

          const participantsData = session.participants || {};
          const list = Object.values(participantsData) as { uid: string; photoURL: string | null }[];
          this.participants.set(list);

          console.log('👥 Raw participants:', session.participants);

          this.isOwner = session.ownerUid === uid;

          console.log('👤 isOwner:', this.isOwner);
          console.log('📥 incomingCode:', incomingCode);
          console.log('📄 currentCode:', this.editor?.getValue());

          if (this.editor) {
            this.editor.updateOptions({
              readOnly: isGroup && !this.isOwner
            });
          }

          if (!this.editor) {
            this.pendingRemoteCode = incomingCode;
            return;
          }

          const currentCode = this.editor.getValue();

          if (this.isOwner) {
            if (!incomingCode || incomingCode.trim() === '') {
              const starter = this.getStarterCode(lang);
              this.editor.setValue(starter);
              this.code.set(starter);
              this.codeChanges$.next(starter);
            }
          } else {
            if (incomingCode && incomingCode !== currentCode) {
              setTimeout(() => {
                if (!this.editor) return;
          
                this.editor.setValue(incomingCode);
                this.code.set(incomingCode);
              }, 50); // mic delay pentru siguranță
            }
          }
          

          if (session.output !== undefined) {
            this.output.set(session.output);
          }
        });
      }

      // Cod sincronizat (pentru owner)
      this.codeChanges$.pipe(debounceTime(150)).subscribe(newCode => {
        if (this.mode() === 'group' && this.sessionId && this.isOwner) {
          this.sessionService.updateSession(this.sessionId, {
            code: newCode,
          });
        }
      });
    });

    // Inițializare editor după ce Monaco e încărcat
    this.waitForMonaco().then(() => {
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

      // ✅ After editor is initialized, add current user as participant
if (this.mode() === 'group' && this.sessionId) {
  const currentUser = this.authService.getCurrentUser();
  if (currentUser?.uid) {
    console.log('🔥 Adding participant:', currentUser.uid);
    this.sessionService.addParticipant(this.sessionId, {
      uid: currentUser.uid,
      photoURL: currentUser.photoURL || null,
    }).then(() => {
      console.log('✅ Participant added');
    }).catch(err => {
      console.error('❌ Failed to add participant', err);
    });
  }
}


      // Load latest code from Firestore once after editor is created
if (this.mode() === 'group' && this.sessionId && !this.isOwner) {
  this.sessionService.getSession(this.sessionId).then(snapshot => {
    const sessionData = snapshot.data();
    const firestoreCode = sessionData?.['code'] ?? '';

    if (firestoreCode && this.editor.getValue().trim() === '') {
      this.editor.setValue(firestoreCode);
      this.code.set(firestoreCode);
    }
  });
}


      this.editor.updateOptions({
        readOnly: this.mode() === 'group' && !this.isOwner
      });

      if (this.pendingRemoteCode && this.mode() === 'group' && !this.isOwner) {
        this.editor.setValue(this.pendingRemoteCode);
        this.code.set(this.pendingRemoteCode);
        this.pendingRemoteCode = null;
      }

      this.editor.onDidChangeModelContent(() => {
        const newCode = this.editor.getValue();
        this.code.set(newCode);

        if (this.mode() === 'group' && this.isOwner) {
          this.codeChanges$.next(newCode);
        }
      });
    });
    
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

  waitForMonaco(): Promise<void> {
    return new Promise<void>((resolve) => {
      const check = (): void => {
        if ((window as any).monaco) {
          resolve();
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    });
  }

  getStarterCode(lang: string): string {
    const templates: Record<string, string> = {
      python: `print("Salut!")`,
      javascript: `console.log("Salut!")`,
      typescript: `console.log("Salut!");`,
      java: `public class Main { public static void main(String[] args) { System.out.println("Salut!"); } }`,
      c: `#include <stdio.h>\nint main() { printf("Salut!\\n"); return 0; }`,
      cpp: `#include <iostream>\nint main() { std::cout << "Salut!" << std::endl; return 0; }`,
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
}
