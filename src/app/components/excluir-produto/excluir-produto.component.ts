import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ProdutoService } from '../../services/produto.service';

@Component({
  selector: 'app-excluir-produto',
  templateUrl: './excluir-produto.component.html',
  styleUrls: ['./excluir-produto.component.css']
})
export class ExcluirProdutoComponent {
  @Input() produtoId!: number;
  @Input() nomeProduto!: string;
  @Input() showModal = false;
  @Output() showModalChange = new EventEmitter<boolean>();
  @Output() produtoExcluido = new EventEmitter<void>();

  loading = false;
  error: string | null = null;

  constructor(private produtoService: ProdutoService) {}

  confirmarExclusao(): void {
    this.loading = true;
    this.error = null;
    
    this.produtoService.excluirProduto(this.produtoId).subscribe({
      next: () => {
        this.produtoExcluido.emit();
        this.fecharModal();
      },
      error: (err) => {
        this.error = 'Erro ao excluir produto: ' + err.message;
        this.loading = false;
      }
    });
  }

  fecharModal(): void {
    this.showModal = false;
    this.showModalChange.emit(false);
  }
}

