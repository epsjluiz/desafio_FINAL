import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
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
  private apiUrl = `${API_BASE_URL}/carrinho`;
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

  constructor(private http: HttpClient) {}

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
    return new Observable((observer) => {
      this.http.post(this.apiUrl, { produto_id: produtoId, quantidade }).subscribe({
        next: (res: any) => {
          this.itemAdded$.next({ total: res.total, nome: '' });
          this.refreshCartTotal();
          observer.next(res);
          observer.complete();
        },
        error: (err) => {
          observer.error(err);
        }
      });
    });
  }

  getCarrinho(): Observable<CarrinhoResponse> {
    return this.http.get<CarrinhoResponse>(this.apiUrl);
  }

  updateItem(itemId: number, quantidade: number): Observable<any> {
    return new Observable((observer) => {
      this.http.put(`${this.apiUrl}/${itemId}`, { quantidade }).subscribe({
        next: (res: any) => {
          this.refreshCartTotal();
          observer.next(res);
          observer.complete();
        },
        error: (err) => observer.error(err)
      });
    });
  }

  removeItem(itemId: number): Observable<any> {
    return new Observable((observer) => {
      this.http.delete(`${this.apiUrl}/${itemId}`).subscribe({
        next: (res: any) => {
          this.refreshCartTotal();
          observer.next(res);
          observer.complete();
        },
        error: (err) => observer.error(err)
      });
    });
  }

  refreshCartTotal(): void {
    this.getCarrinho().subscribe({
      next: (res) => this.cartTotalSubject.next(res.total),
      error: () => {}
    });
  }
}
