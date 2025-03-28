import {
  Component,
  ElementRef,
  AfterViewInit,
  ViewChild,
  signal,
  effect
} from '@angular/core';

declare const monaco: any;

@Component({
  selector: 'app-monaco-editor-wrapper',
  standalone: true,
  templateUrl: './monaco-editor-wrapper.component.html',
  styleUrl: './monaco-editor-wrapper.component.css',
})
export class MonacoEditorWrapperComponent implements AfterViewInit {
  @ViewChild('editorContainer', { static: true }) editorContainer!: ElementRef;
  
  code = signal(`function hello() {
  console.log('Hello, world!');
}`);
  language = signal('typescript');

  private editor: any;

  ngAfterViewInit() {
    this.waitForMonaco().then(() => {
      this.initEditor();
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
  
  
  initEditor() {
    this.editor = monaco.editor.create(this.editorContainer.nativeElement, {
      value: this.code(),
      language: this.language(),
      theme: 'vs-dark',
      automaticLayout: true,
    });
  
    this.editor.onDidChangeModelContent(() => {
      const updated = this.editor.getValue();
      this.code.set(updated);
      console.log('[Editor] Code updated:', updated);
    });
  }

  output = '';

  runCode() {
    const codeToRun = this.editor?.getValue();
    const logs: string[] = [];
  
    // Monkey patch console.log
    const originalConsoleLog = console.log;
    console.log = (...args: any[]) => {
      logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' '));
      originalConsoleLog.apply(console, args); // still show in real console
    };
  
    try {
      const result = eval(codeToRun);
      if (result !== undefined) {
        logs.push(String(result));
      }
      this.output = logs.join('\n') || '[Executed with no return]';
    } catch (err: any) {
      this.output = '❌ ' + err.message;
    } finally {
      console.log = originalConsoleLog; // restore original log
    }
  }
  

}  