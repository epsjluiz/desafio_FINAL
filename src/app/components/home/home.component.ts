import { Component, OnInit } from '@angular/core';
import { ProdutoService, Produto } from '../../services/produto.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  produtos: Produto[] = [];
  loading = true;
  error: string | null = null;
  currentIndex = 0;

  constructor(private produtoService: ProdutoService) {}

  ngOnInit(): void {
    this.carregarProdutos();
  }

  carregarProdutos(): void {
    this.loading = true;
    this.error = null;
    this.produtoService.getProdutos().subscribe({
      next: (data) => {
        this.produtos = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erro ao carregar produtos: ' + err.message;
        console.error('Erro ao carregar produtos:', err);
        this.loading = false;
      }
    });
  }

  nextSlide(): void {
    if (this.currentIndex < this.produtos.length - 1) {
      this.currentIndex++;
    }
  }

  previousSlide(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  goToSlide(index: number): void {
    this.currentIndex = index;
  }
}

