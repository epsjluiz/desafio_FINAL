import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CartService } from './services/cart.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  currentRoute = '';
  showCartAlert = false;

  constructor(private router: Router, private cartService: CartService) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentRoute = event.url;
    });

    this.cartService.itemAdded$.subscribe(() => {
      this.showCartAlert = true;
      setTimeout(() => { this.showCartAlert = false; }, 2500);
    });
  }

  isActiveRoute(route: string): boolean {
    return this.currentRoute === route;
  }
}

