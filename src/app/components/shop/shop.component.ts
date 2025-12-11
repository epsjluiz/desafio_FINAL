import { Component, OnInit } from '@angular/core';
import { ProdutoService, Produto } from '../../services/produto.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.css']
})
export class ShopComponent implements OnInit {
  produtos: Produto[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(private produtoService: ProdutoService, private cartService: CartService) {}

  ngOnInit(): void {
    this.carregarProdutos();
  }

  carregarProdutos(): void {
    this.produtoService.getProdutos().subscribe({
      next: (data) => {
        this.produtos = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Erro ao carregar os produtos.';
        console.log(err);
        this.isLoading = false;
      }
    });
  }

  adicionarAoCarrinho(produto: Produto): void {
    if (!produto.id) return;
    this.cartService.addItem(produto.id).subscribe({
      next: () => {},
      error: (err) => { console.error('Erro ao adicionar ao carrinho:', err); }
    });
  }
}

