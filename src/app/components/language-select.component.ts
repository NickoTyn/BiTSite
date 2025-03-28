import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-language-select',
  imports: [CommonModule],
  templateUrl: './language-select.component.html',
  styleUrls: ['./language-select.component.css'],
})
export class LanguageSelectComponent implements OnInit {
  mode: 'solo' | 'group' = 'solo';
  sessionId: string | null = null;
  languages: any[] = [];

  readonly basicLanguages = [
    'python',
    'javascript',
    'typescript',
    'java',
    'c',
    'c++',
    'cpp',
    'csharp',
    'ruby',
    'php',
    'swift',
    'kotlin',
    'rust'
  ];
  

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      this.mode = (params.get('mode') as 'solo' | 'group') || 'solo';
      this.sessionId = params.get('sessionId');
    });

    this.http.get<any[]>('https://emkc.org/api/v2/piston/runtimes').subscribe(data => {
      this.languages = data
        .filter(lang => this.basicLanguages.includes(lang.language.toLowerCase()))
        .sort((a, b) => a.language.localeCompare(b.language));
    });
  }    

  selectLanguage(lang: string, version: string) {
    const queryParams: any = {
      lang,
      version,
      mode: this.mode,
    };

    if (this.sessionId) {
      queryParams.sessionId = this.sessionId;
    }

    this.router.navigate(['/editor'], { queryParams });
  }
}
