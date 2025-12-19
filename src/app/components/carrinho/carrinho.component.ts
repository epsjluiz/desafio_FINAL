import { Component, OnInit } from '@angular/core';
import { CartService, CarrinhoItem } from '../../services/cart.service';

@Component({
  selector: 'app-carrinho',
  templateUrl: './carrinho.component.html',
  styleUrls: ['./carrinho.component.css']
})
export class CarrinhoComponent implements OnInit {
  itens: CarrinhoItem[] = [];
  totalItens = 0;
  loading = true;
  error: string | null = null;
  isOpen = false;
  
  cep: string = '';
  distancia: number | null = null;
  taxaEntrega: number = 5.99;
  valorPorKm: number = 1.50;
  endereco: string = '';

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.carregarCarrinho();
    this.cartService.isCartOpen$.subscribe((isOpen) => {
      this.isOpen = isOpen;
      if (isOpen) {
        this.carregarCarrinho();
      }
    });
  }

  closeCart(): void {
    this.cartService.toggleCart(false);
  }

  carregarCarrinho(): void {
    this.loading = true;
    this.cartService.getCarrinho().subscribe({
      next: (res) => {
        this.itens = res.itens;
        this.totalItens = res.total;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erro ao carregar carrinho: ' + err.message;
        this.loading = false;
      }
    });
  }

  incrementar(item: CarrinhoItem): void {
    this.cartService.updateItem(item.id, item.quantidade + 1).subscribe({
      next: () => this.carregarCarrinho(),
      error: (err) => console.error('Erro ao incrementar', err)
    });
  }

  decrementar(item: CarrinhoItem): void {
    if (item.quantidade <= 1) {
      this.remover(item);
      return;
    }
    this.cartService.updateItem(item.id, item.quantidade - 1).subscribe({
      next: () => this.carregarCarrinho(),
      error: (err) => console.error('Erro ao decrementar', err)
    });
  }

  remover(item: CarrinhoItem): void {
    if(confirm('Tem certeza que deseja remover este item?')) {
      this.cartService.removeItem(item.id).subscribe({
        next: () => this.carregarCarrinho(),
        error: (err) => console.error('Erro ao remover', err)
      });
    }
  }

  calcularSubtotal(): number {
    return this.itens.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
  }

  calcularTotal(): number {
    return this.calcularSubtotal() + this.taxaEntrega;
  }
  
}
