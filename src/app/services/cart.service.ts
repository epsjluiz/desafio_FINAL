import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject, of, switchMap } from 'rxjs';
import { ProdutoService } from './produto.service';
import { API_BASE_URL } from '../config';

export interface CarrinhoItem {
  id: number;
  produto_id: number;
  quantidade: number;
  nome: string;
  preco: number;
  preco_anterior?: number;
  imagem_url?: string;
}

export interface CarrinhoResponse {
  itens: CarrinhoItem[];
  total: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private storageKey = 'carrinho_itens';
  itemAdded$ = new Subject<{ total: number; nome: string }>();
  private cartTotalSubject = new BehaviorSubject<number>(0);
  cartTotal$ = this.cartTotalSubject.asObservable();
  
  private isCartOpen = new BehaviorSubject<boolean>(false);
  isCartOpen$ = this.isCartOpen.asObservable();

  private cepSubject = new BehaviorSubject<string>('');
  cep$ = this.cepSubject.asObservable();

  private distanciaSubject = new BehaviorSubject<number | null>(null);
  distancia$ = this.distanciaSubject.asObservable();

  private taxaEntregaSubject = new BehaviorSubject<number>(5.99);
  taxaEntrega$ = this.taxaEntregaSubject.asObservable();

  private enderecoSubject = new BehaviorSubject<string>('');
  endereco$ = this.enderecoSubject.asObservable();

  constructor(private http: HttpClient, private produtoService: ProdutoService) {}

  toggleCart(isOpen: boolean): void {
    this.isCartOpen.next(isOpen);
  }

  calcularFrete(cep: string): void {
    if (!cep || cep.length < 8) {
      alert('Por favor, digite um CEP válido.');
      return;
    }

    this.cepSubject.next(cep);

    const cepNum = parseInt(cep.replace(/\D/g, '')) || 0;
    const distancia = (cepNum % 15) + 1; 
    this.distanciaSubject.next(distancia);
    let taxa = 0;
    if (distancia > 5) {
      taxa = (1.5 * distancia) + 19.5;
    } else {
      taxa = 0;
    }
    this.taxaEntregaSubject.next(taxa);
    const endereco = `Rua Exemplo, ${cepNum % 1000}, Bairro Simulado (Loja: 42702-120)`;
    this.enderecoSubject.next(endereco);
  }

  addItem(produtoId: number, quantidade: number = 1): Observable<any> {
    return this.getCarrinho().pipe(
      switchMap((res) => this.produtoService.getProduto(produtoId).pipe(
        switchMap((produto) => {
          const itens = res.itens || [];
          const existente = itens.find(i => i.produto_id === produtoId);
          if (existente) {
            existente.quantidade = (existente.quantidade || 1) + (quantidade || 1);
          } else {
            itens.push({
              id: Date.now(),
              produto_id: produtoId,
              quantidade: quantidade || 1,
              nome: produto.nome,
              preco: produto.preco,
              preco_anterior: produto.preco_anterior,
              imagem_url: produto.imagem_url
            });
          }
          localStorage.setItem(this.storageKey, JSON.stringify(itens));
          const total = itens.reduce((acc, i) => acc + (i.quantidade || 0), 0);
          this.itemAdded$.next({ total, nome: produto.nome });
          this.cartTotalSubject.next(total);
          return of({ message: 'Item adicionado ao carrinho', total });
        })
      ))
    );
  }

  getCarrinho(): Observable<CarrinhoResponse> {
    const itens = JSON.parse(localStorage.getItem(this.storageKey) || '[]') as CarrinhoItem[];
    const total = itens.reduce((acc, i) => acc + (i.quantidade || 0), 0);
    return of({ itens, total });
  }

  updateItem(itemId: number, quantidade: number): Observable<any> {
    const itens = JSON.parse(localStorage.getItem(this.storageKey) || '[]') as CarrinhoItem[];
    const idx = itens.findIndex(i => i.id === itemId);
    if (idx >= 0) {
      if (quantidade <= 0) {
        itens.splice(idx, 1);
      } else {
        itens[idx].quantidade = quantidade;
      }
      localStorage.setItem(this.storageKey, JSON.stringify(itens));
    }
    const total = itens.reduce((acc, i) => acc + (i.quantidade || 0), 0);
    this.cartTotalSubject.next(total);
    return of({ message: 'Quantidade atualizada', total });
  }

  removeItem(itemId: number): Observable<any> {
    const itens = JSON.parse(localStorage.getItem(this.storageKey) || '[]') as CarrinhoItem[];
    const updated = itens.filter(i => i.id !== itemId);
    localStorage.setItem(this.storageKey, JSON.stringify(updated));
    const total = updated.reduce((acc, i) => acc + (i.quantidade || 0), 0);
    this.cartTotalSubject.next(total);
    return of({ message: 'Item removido do carrinho' });
  }

  refreshCartTotal(): void {
    this.getCarrinho().subscribe({
      next: (res) => this.cartTotalSubject.next(res.total),
      error: () => {}
    });
  }
}
