import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  signal,
  effect
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PistonService } from '../services/piston.service';
import { CommonModule } from '@angular/common';
import { SessionService } from '../services/session.service';
import { debounceTime, Subject } from 'rxjs';
import { AuthService } from '../auth.service';

declare const monaco: any; // Asigură-te că ai monaco disponibil global

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


  private editor: any;
  private lastLocalUpdate: number = Date.now(); // 👈 Adaugă asta

  constructor(
    private route: ActivatedRoute,
    private piston: PistonService,
    private sessionService: SessionService,
    private authService: AuthService
  ) {}
  

  ngAfterViewInit() {
    this.route.queryParamMap.subscribe(params => {
      this.language.set(params.get('lang') || 'python');
      this.version.set(params.get('version') || '3.10.0');
      this.mode.set((params.get('mode') as any) || 'solo');
      this.sessionId = params.get('sessionId');

      if (this.mode() === 'group' && this.sessionId) {
        const currentUser = this.authService.getCurrentUser();
        const uid = currentUser?.uid;
      
        if (!uid) return;
      
        this.sessionService.getSession(this.sessionId).then(session => {
          if (!session.exists()) {
            this.sessionService.createSession(this.sessionId || '', {
              code: '',
              language: this.language(),
              version: this.version(),
              output: ''
            }, uid);
          }
        });
      }
      

      if (this.mode() === 'group' && this.sessionId) {
        this.sessionService.listenToSession(this.sessionId).subscribe(session => {
          const incomingCode = session.code;
          const currentCode = this.editor.getValue();
        
          if (session.ownerUid && session.ownerUid === this.authService.getCurrentUser()?.uid) {
            this.isOwner = true;
          } else {
            this.isOwner = false;
          }          

          this.editor.updateOptions({
            readOnly: !this.isOwner
          });
          

          if (incomingCode && incomingCode !== currentCode) {
            const selection = this.editor.getSelection(); // salvează poziția cursorului
        
            this.editor.executeEdits(null, [
              {
                range: this.editor.getModel().getFullModelRange(),
                text: incomingCode,
                forceMoveMarkers: true,
              },
            ]);
        
            this.editor.setSelection(selection); // restaurează cursorul
            this.code.set(incomingCode);
          }
        
          if (session.output !== undefined) {
            this.output.set(session.output);
          }
        });
        
      }
    
      this.codeChanges$.pipe(debounceTime(150)).subscribe(newCode => {
        if (this.mode() === 'group' && this.sessionId) {
          this.sessionService.updateSession(this.sessionId, {
            code: newCode,
          });
        }
      });      

    });

    this.waitForMonaco().then(() => {
      this.editor = monaco.editor.create(this.editorContainer.nativeElement, {
        value: '',
        language: this.mapToMonacoLang(this.language()),
        theme: 'vs-dark',
        automaticLayout: true,
      });     
      
      this.editor.updateOptions({
        readOnly: !this.isOwner
      });

      const starter = this.getStarterCode(this.language());
      this.editor.setValue(starter);
      this.code.set(starter);

      this.editor.onDidChangeModelContent(() => {
        const newCode = this.editor.getValue();
        this.code.set(newCode);
        this.codeChanges$.next(newCode); // doar aici trimitem
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
        console.log('[Piston Response]', res); // 👈 adaugă asta
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
