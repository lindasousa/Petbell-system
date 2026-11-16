/**
 * Servico de Comunicacao com a API de Alertas, Pets e Doacoes
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Alerta, MensagemComunidade, RespostaApi, StatusPet } from '../models/alerta.model';

@Injectable({
  providedIn: 'root',
})
export class AlertaService {
  private readonly baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  public listarAlertas(filtros?: { status?: string; busca?: string; limite?: number; pagina?: number }): Observable<RespostaApi<Alerta[]>> {
    let params = new HttpParams();

    if (filtros?.status && filtros.status !== 'TODOS') {
      params = params.set('status', filtros.status);
    }
    if (filtros?.busca) {
      params = params.set('busca', filtros.busca);
    }
    if (filtros?.limite) {
      params = params.set('limite', filtros.limite.toString());
    }
    if (filtros?.pagina) {
      params = params.set('pagina', filtros.pagina.toString());
    }

    return this.http.get<RespostaApi<Alerta[]>>(`${this.baseUrl}/alertas`, { params });
  }

  public buscarPorId(id: number): Observable<RespostaApi<Alerta>> {
    return this.http.get<RespostaApi<Alerta>>(`${this.baseUrl}/alertas/${id}`);
  }

  public criarAlerta(dados: any): Observable<RespostaApi<Alerta>> {
    return this.http.post<RespostaApi<Alerta>>(`${this.baseUrl}/alertas`, dados);
  }

  public atualizarStatus(id: number, status_pet: StatusPet): Observable<RespostaApi<Alerta>> {
    return this.http.patch<RespostaApi<Alerta>>(`${this.baseUrl}/alertas/${id}/status`, {
      status_pet,
    });
  }

  public listarMensagens(alertaId: number): Observable<RespostaApi<MensagemComunidade[]>> {
    return this.http.get<RespostaApi<MensagemComunidade[]>>(`${this.baseUrl}/alertas/${alertaId}/mensagens`);
  }

  public enviarMensagem(alertaId: number, conteudo: string, autor_nome?: string): Observable<RespostaApi<MensagemComunidade>> {
    return this.http.post<RespostaApi<MensagemComunidade>>(`${this.baseUrl}/alertas/${alertaId}/mensagens`, {
      conteudo,
      autor_nome,
    });
  }

  public obterEstatisticas(): Observable<RespostaApi<any>> {
    return this.http.get<RespostaApi<any>>(`${this.baseUrl}/dashboard/estatisticas`);
  }

  public obterDoacoes(): Observable<RespostaApi<any[]>> {
    return this.http.get<RespostaApi<any[]>>(`${this.baseUrl}/doacoes`);
  }
}
