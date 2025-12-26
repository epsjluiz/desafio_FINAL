import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config';

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
  private apiUrl = `${API_BASE_URL}/produtos`;

  constructor(private http: HttpClient) { }

  getProdutos(): Observable<Produto[]> {
    return this.http.get<Produto[]>(this.apiUrl);
  }

  getProduto(id: number): Observable<Produto> {
    return this.http.get<Produto>(`${this.apiUrl}/${id}`);
  }

  criarProduto(produto: Produto): Observable<any> {
    return this.http.post(this.apiUrl, produto);
  }

  atualizarProduto(id: number, produto: Produto): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, produto);
  }

  excluirProduto(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}

