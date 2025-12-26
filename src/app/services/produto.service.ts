import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, switchMap, tap } from 'rxjs';

export interface Produto {
  id?: number;
  nome: string;
  preco: number;
  preco_anterior?: number;
  imagem_url?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProdutoService {
  private storageKey = 'produtos';
  private seedUrl = 'assets/produtos.json';

  constructor(private http: HttpClient) { }

  private ensureSeed(): Observable<void> {
    const existing = localStorage.getItem(this.storageKey);
    if (existing) return of(void 0);
    return this.http.get<Produto[]>(this.seedUrl).pipe(
      tap((data) => {
        const withIds = (data || []).map((p, idx) => ({ id: p.id ?? idx + 1, ...p }));
        localStorage.setItem(this.storageKey, JSON.stringify(withIds));
      }),
      switchMap(() => of(void 0))
    );
  }

  getProdutos(): Observable<Produto[]> {
    return this.ensureSeed().pipe(
      switchMap(() => of(JSON.parse(localStorage.getItem(this.storageKey) || '[]')))
    );
  }

  getProduto(id: number): Observable<Produto> {
    return this.getProdutos().pipe(
      switchMap((produtos) => of(produtos.find(p => p.id === id)!))
    );
  }

  criarProduto(produto: Produto): Observable<any> {
    return this.getProdutos().pipe(
      switchMap((produtos) => {
        const nextId = produtos.length ? Math.max(...produtos.map(p => p.id || 0)) + 1 : 1;
        const novo = { ...produto, id: nextId };
        const updated = [novo, ...produtos];
        localStorage.setItem(this.storageKey, JSON.stringify(updated));
        return of({ id: nextId });
      })
    );
  }

  atualizarProduto(id: number, produto: Produto): Observable<any> {
    return this.getProdutos().pipe(
      switchMap((produtos) => {
        const updated = produtos.map(p => p.id === id ? { ...p, ...produto, id } : p);
        localStorage.setItem(this.storageKey, JSON.stringify(updated));
        return of({ ok: true });
      })
    );
  }

  excluirProduto(id: number): Observable<any> {
    return this.getProdutos().pipe(
      switchMap((produtos) => {
        const updated = produtos.filter(p => p.id !== id);
        localStorage.setItem(this.storageKey, JSON.stringify(updated));
        return of({ ok: true });
      })
    );
  }
}

