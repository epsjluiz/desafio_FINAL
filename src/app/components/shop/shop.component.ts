import { Component, OnInit } from '@angular/core';
import { ProdutoService, Produto } from '../../services/produto.service';

@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.css']
})
export class ShopComponent implements OnInit {
  produtos: Produto[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(private produtoService: ProdutoService) {}

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
}

