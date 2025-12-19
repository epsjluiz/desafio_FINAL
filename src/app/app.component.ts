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
  cartCount = 0;

  constructor(private router: Router, public cartService: CartService) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentRoute = event.url;
    });

    this.cartService.itemAdded$.subscribe(() => {
      this.showCartAlert = true;
      setTimeout(() => { this.showCartAlert = false; }, 2500);
    });

    this.cartService.cartTotal$.subscribe((count) => {
      this.cartCount = count || 0;
    });
    this.cartService.refreshCartTotal();
  }

  toggleCart(): void {
    this.cartService.toggleCart(true);
  }

  onCepEnter(event: any): void {
    const cep = event.target.value;
    if (cep) {
      this.cartService.calcularFrete(cep);
      this.cartService.toggleCart(true);
    }
  }

  onCepBlur(event: any): void {
    const cep = event.target.value;
    if (cep) {
      this.cartService.calcularFrete(cep);
    }
  }

  isActiveRoute(route: string): boolean {
    return this.currentRoute === route;
  }
}
