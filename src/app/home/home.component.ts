import { Component } from '@angular/core';
import { HeaderComponent } from "../header/header.component";
import { MainactivitiesComponent } from "../mainactivities/mainactivities.component";
import { JoinUsFormComponent } from "../join-us-form/join-us-form.component";
import { FooterComponent } from "../footer/footer.component";
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-home',
    standalone: true,
    templateUrl: './home.component.html',
    styleUrl: './home.component.css',
    imports: [HeaderComponent, MainactivitiesComponent, JoinUsFormComponent, FooterComponent, RouterOutlet]
})
export class HomeComponent {

}
