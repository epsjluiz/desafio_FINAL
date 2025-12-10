import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ProdutoService } from '../../services/produto.service';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.css']
})
export class CadastroComponent {
  nome = '';
  preco: number | null = null;
  preco_anterior: number | undefined;
  imagem = '';
  errorMessage = '';

  constructor(
    private produtoService: ProdutoService,
    private router: Router
  ) {}

  handleSubmit(): void {
    let preco_anterior: number | undefined = undefined;
    if (this.preco_anterior !== null) {
      preco_anterior = this.preco_anterior;
    }
    if (this.nome && this.preco && this.imagem) {
      this.produtoService.criarProduto({
        nome: this.nome,
        preco: this.preco,
        preco_anterior: this.preco_anterior,
        imagem_url: this.imagem
      }).subscribe({
        next: () => {
          this.router.navigate(['/listagem']);
        },
        error: (err) => {
          const serverMsg = err?.error?.error || '';
          const status = err?.status ? ` (código ${err.status})` : '';
          const detail = serverMsg ? `: ${serverMsg}` : '';
          this.errorMessage = `Erro ao cadastrar produto${status}${detail}`;
          console.error(err);
        }
      });
    } else {
      this.errorMessage = 'Todos os campos são obrigatórios.';
    }
  }
}

