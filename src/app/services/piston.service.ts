import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RunCodePayload {
  language: string;
  version: string;
  code: string;
  stdin?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PistonService {
  private readonly apiUrl = 'https://emkc.org/api/v2/piston';

  constructor(private http: HttpClient) {}

  getRuntimes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/runtimes`);
  }

  runCode(payload: RunCodePayload): Observable<any> {
    const body = {
      language: payload.language,
      version: payload.version,
      files: [{ name: 'main', content: payload.code }],
      stdin: payload.stdin || '',
    };

    return this.http.post(`${this.apiUrl}/execute`, body);
  }

  
}
