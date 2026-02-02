
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter as provideNgRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes'; 

bootstrapApplication(AppComponent, {
  providers: [
    provideNgRouter(routes), 
  ],
}).catch(err => console.error(err));