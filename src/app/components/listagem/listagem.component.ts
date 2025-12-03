import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProdutoService, Produto } from '../../services/produto.service';

@Component({
  selector: 'app-listagem',
  templateUrl: './listagem.component.html',
  styleUrls: ['./listagem.component.css']
})
export class ListagemComponent implements OnInit {
  produtos: Produto[] = [];
  loading = true;
  error: string | null = null;
  showModalExclusao = false;
  produtoParaExcluir: Produto | null = null;

  constructor(
    private produtoService: ProdutoService,
    private router: Router
  ) {}

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

  abrirModalExclusao(produto: Produto): void {
    this.produtoParaExcluir = produto;
    this.showModalExclusao = true;
  }

  produtoExcluido(): void {
    this.carregarProdutos();
    this.produtoParaExcluir = null;
  }
}

