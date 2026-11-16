/**
 * Servico de Autenticacao e Gestao de Sessao no Front-end
 * Gerencia tokens JWT, estado reativo do usuario e controle de permissoes.
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { Usuario, RespostaApi } from '../models/alerta.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:3000/api/auth';
  private readonly tokenKey = 'petbell_jwt_token';
  private readonly userKey = 'petbell_usuario';

  private usuarioAtualSubject = new BehaviorSubject<Usuario | null>(null);
  public usuarioAtual$ = this.usuarioAtualSubject.asObservable();

  constructor(private http: HttpClient) {
    this.restaurarSessaoLocal();
  }

  private restaurarSessaoLocal(): void {
    const usuarioSalvo = localStorage.getItem(this.userKey);
    const token = this.obterToken();

    if (usuarioSalvo && token) {
      try {
        this.usuarioAtualSubject.next(JSON.parse(usuarioSalvo));
      } catch (e) {
        this.limparSessao();
      }
    }
  }

  public obterToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  public estaAutenticado(): boolean {
    return !!this.obterToken();
  }

  public getUsuarioAtual(): Usuario | null {
    return this.usuarioAtualSubject.value;
  }

  public isOngOuAdmin(): boolean {
    const usuario = this.getUsuarioAtual();
    return !!usuario && (usuario.tipo === 'ong' || usuario.tipo === 'administrador');
  }

  public cadastrar(dados: any): Observable<RespostaApi<{ usuario: Usuario; token: string }>> {
    return this.http.post<RespostaApi<{ usuario: Usuario; token: string }>>(
      `${this.apiUrl}/cadastrar`,
      dados
    ).pipe(
      tap((resposta) => {
        if (resposta.sucesso && resposta.dados) {
          this.salvarSessao(resposta.dados.token, resposta.dados.usuario);
        }
      })
    );
  }

  public login(credenciais: { email: string; senha: string }): Observable<RespostaApi<{ usuario: Usuario; token: string }>> {
    return this.http.post<RespostaApi<{ usuario: Usuario; token: string }>>(
      `${this.apiUrl}/login`,
      credenciais
    ).pipe(
      tap((resposta) => {
        if (resposta.sucesso && resposta.dados) {
          this.salvarSessao(resposta.dados.token, resposta.dados.usuario);
        }
      })
    );
  }

  public carregarPerfil(): Observable<RespostaApi<Usuario>> {
    return this.http.get<RespostaApi<Usuario>>(`${this.apiUrl}/me`).pipe(
      tap((resposta) => {
        if (resposta.sucesso && resposta.dados) {
          localStorage.setItem(this.userKey, JSON.stringify(resposta.dados));
          this.usuarioAtualSubject.next(resposta.dados);
        }
      })
    );
  }

  public logout(): void {
    const token = this.obterToken();
    if (token) {
      this.http.post(`${this.apiUrl}/logout`, {}).pipe(
        catchError(() => of(null))
      ).subscribe();
    }
    this.limparSessao();
  }

  private salvarSessao(token: string, usuario: Usuario): void {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userKey, JSON.stringify(usuario));
    this.usuarioAtualSubject.next(usuario);
  }

  private limparSessao(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.usuarioAtualSubject.next(null);
  }
}
