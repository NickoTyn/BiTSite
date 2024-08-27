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


export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' }, // Default route
  { path: 'home', component: HomeComponent },
  { path: 'account', component: AccountComponent },
  { path: 'validation', component: PostValidationHubComponent},
  { path: 'about-us', component: AboutUsComponent},
  { path: 'past-activities', component: PastActivitiesComponent},
  { path: 'contact', component: ContactComponent}



];
