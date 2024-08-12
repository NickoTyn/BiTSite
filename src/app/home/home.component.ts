import { Component } from '@angular/core';
import { HeaderComponent } from "../header/header.component";
import { MainactivitiesComponent } from "../mainactivities/mainactivities.component";
import { JoinUsFormComponent } from "../join-us-form/join-us-form.component";
import { FooterComponent } from "../footer/footer.component";
import { RouterOutlet } from '@angular/router';
import { MemberCounterComponent } from "../member-counter/member-counter.component";
import { HSEPartnershipComponent } from "../hse-partnership/hse-partnership.component";
import { SponsorsComponent } from "../sponsors/sponsors.component";

@Component({
    selector: 'app-home',
    standalone: true,
    templateUrl: './home.component.html',
    styleUrl: './home.component.css',
    imports: [HeaderComponent, MainactivitiesComponent, JoinUsFormComponent, FooterComponent, RouterOutlet, MemberCounterComponent, HSEPartnershipComponent, SponsorsComponent]
})
export class HomeComponent {

    currentCount: number = 200;

    incrementCount() {
      this.currentCount += 1;
    }

}
