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

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
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
}

