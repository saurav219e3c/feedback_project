import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterLink, RouterModule, CommonModule],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit, OnDestroy {
  showNavButtons = true;
  navButtonClass = '';
  
  // Typing animation properties
  typedMainTitle = '';
  typedPortalTitle = '';
  mainTitleComplete = false;
  portalTitleComplete = false;
  
  private mainTitleText = 'FeedbackTrack';
  private portalTitleText = 'Select Your Portal For Feedback';
  
  private typingIntervals: any[] = [];

  constructor(
    public auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.startTypingAnimations();
  }

  ngOnDestroy(): void {
    this.typingIntervals.forEach(interval => clearInterval(interval));
  }

  private startTypingAnimations(): void {
    // Start main title typing after a short delay
    this.typeText(this.mainTitleText, (char) => {
      this.typedMainTitle += char;
    }, 120, 500, () => {
      this.mainTitleComplete = true;
    });
    
    // Start portal title typing after main title is done
    this.typeText(this.portalTitleText, (char) => {
      this.typedPortalTitle += char;
    }, 80, 2000, () => {
      this.portalTitleComplete = true;
    });
  }

  private typeText(text: string, callback: (char: string) => void, speed: number, delay: number, onComplete?: () => void): void {
    setTimeout(() => {
      let index = 0;
      const interval = setInterval(() => {
        if (index < text.length) {
          callback(text.charAt(index));
          index++;
        } else {
          clearInterval(interval);
          const intervalIndex = this.typingIntervals.indexOf(interval);
          if (intervalIndex > -1) {
            this.typingIntervals.splice(intervalIndex, 1);
          }
          if (onComplete) {
            onComplete();
          }
        }
      }, speed);
      this.typingIntervals.push(interval);
    }, delay);
  }

  get isLoggedIn$() {
    return this.auth.isLoggedIn$;
  }

  @HostListener('window:scroll')
  onScroll(): void {
    const scrollPosition = window.scrollY;
    const viewportHeight = window.innerHeight;
    
    // Hide nav buttons when in the roles section (third viewport - scroll > 2 * vh)
    this.showNavButtons = scrollPosition < viewportHeight * 2;
    
    // Change button color to fade orange in second viewport (about section)
    if (scrollPosition >= viewportHeight && scrollPosition < viewportHeight * 2) {
      this.navButtonClass = 'fade-orange';
    } else {
      this.navButtonClass = '';
    }
  }

  scrollToAbout(): void {
    const element = document.getElementById('about-anchor');
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  scrollToRoles(): void {
    const element = document.getElementById('roles-anchor');
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/auth/home-page']);
  }
}
