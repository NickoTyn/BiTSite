import { Routes } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { AccountComponent } from './account/account.component';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { PostValidationHubComponent } from './post-validation-hub/post-validation-hub.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { PastActivitiesComponent } from './past-activities/past-activities.component';
import { ContactComponent } from './contact/contact.component';
import { PastActivitiesGalleryComponent } from './past-activities-gallery/past-activities-gallery.component';
import { PolicyAndCookiesComponent } from './policy-and-cookies/policy-and-cookies.component';
import { RaffleComponent } from './raffle/raffle.component';
import { PastActivitiesCourseComponent } from './past-activities-course/past-activities-course.component';
import { PumpkinVoteComponent } from './pumpkin-vote/pumpkin-vote.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' }, // Default route
  { path: 'home', component: HomeComponent },
  { path: 'account', component: AccountComponent },
  { path: 'validation', component: PostValidationHubComponent },
  { path: 'about-us', component: AboutUsComponent },
  { path: 'past-activities', component: PastActivitiesComponent },
  { path: 'past-activities-gallery/:date', component: PastActivitiesGalleryComponent },
  { path: 'past-activities-course/:date', component: PastActivitiesCourseComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'policy-and-cookies', component: PolicyAndCookiesComponent },
  { path: 'halloween-vote', component: PumpkinVoteComponent },

];
