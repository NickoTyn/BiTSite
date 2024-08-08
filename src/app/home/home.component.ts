import { Component } from '@angular/core';
import { HeaderComponent } from "../header/header.component";
import { MainactivitiesComponent } from "../mainactivities/mainactivities.component";
import { JoinUsFormComponent } from "../join-us-form/join-us-form.component";
import { FooterComponent } from "../footer/footer.component";
import { RouterOutlet } from '@angular/router';
import { MemberCounterComponent } from "../member-counter/member-counter.component";

@Component({
    selector: 'app-home',
    standalone: true,
    templateUrl: './home.component.html',
    styleUrl: './home.component.css',
    imports: [HeaderComponent, MainactivitiesComponent, JoinUsFormComponent, FooterComponent, RouterOutlet, MemberCounterComponent]
})
export class HomeComponent {

    currentCount: number = 200;

    incrementCount() {
      this.currentCount += 1;
    }

}
