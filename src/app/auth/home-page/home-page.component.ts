import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, RouterModule],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent {
  scrollToAbout(): void {
    const element = document.getElementById('about-anchor');
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  scrollToRoles(): void {
    const element = document.getElementById('roles-anchor');
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

