import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProdutoService, Produto } from '../../services/produto.service';

@Component({
  selector: 'app-editar-produto',
  templateUrl: './editar-produto.component.html',
  styleUrls: ['./editar-produto.component.css']
})
export class EditarProdutoComponent implements OnInit {
  produto: Produto = {
    nome: '',
    preco: 0,
    imagem_url: ''
  };
  loading = true;
  error: string | null = null;

  constructor(
    private produtoService: ProdutoService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.carregarProduto(id);
  }

  carregarProduto(id: number): void {
    this.produtoService.getProduto(id).subscribe({
      next: (data) => {
        this.produto = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro completo:', err);
        this.error = 'Erro ao carregar produto: ' + err.message;
        this.loading = false;
      }
    });
  }

  atualizarProduto(): void {
    const id = this.route.snapshot.params['id'];
    this.produtoService.atualizarProduto(id, this.produto).subscribe({
      next: () => {
        alert('Produto atualizado com sucesso!');
        this.router.navigate(['/listagem']);
      },
      error: (err) => {
        this.error = 'Erro ao atualizar produto: ' + err.message;
      }
    });
  }

  voltar(): void {
    this.router.navigate(['/listagem']);
  }
}

