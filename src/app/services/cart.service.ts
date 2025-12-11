import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

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
  private apiUrl = 'http://localhost:3001/carrinho';
  itemAdded$ = new Subject<{ total: number; nome: string }>();

  constructor(private http: HttpClient) {}

  addItem(produtoId: number, quantidade: number = 1): Observable<any> {
    return new Observable((observer) => {
      this.http.post(this.apiUrl, { produto_id: produtoId, quantidade }).subscribe({
        next: (res: any) => {
          this.itemAdded$.next({ total: res.total, nome: '' });
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
}
