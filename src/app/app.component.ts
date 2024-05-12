import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';
import { HeaderComponent } from './header/header.component'; 
import { MainactivitiesComponent } from './mainactivities/mainactivities.component';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [
    HomepageComponent,
    HeaderComponent,
    MainactivitiesComponent
  ]
})
export class AppComponent {
  title = 'BiTSite';
}
