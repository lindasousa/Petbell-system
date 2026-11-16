/**
 * Servico de Notificacoes e Feedbacks Acessiveis
 * Emite mensagens de feedback visual com atributos ARIA para leitores de tela.
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Notificacao {
  tipo: 'sucesso' | 'erro' | 'info';
  texto: string;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notificacaoSubject = new BehaviorSubject<Notificacao | null>(null);
  public notificacao$ = this.notificacaoSubject.asObservable();
  private timer: any;

  public sucesso(texto: string): void {
    this.exibir('sucesso', texto);
  }

  public erro(texto: string): void {
    this.exibir('erro', texto);
  }

  public info(texto: string): void {
    this.exibir('info', texto);
  }

  public fechar(): void {
    this.notificacaoSubject.next(null);
    if (this.timer) clearTimeout(this.timer);
  }

  private exibir(tipo: 'sucesso' | 'erro' | 'info', texto: string): void {
    if (this.timer) clearTimeout(this.timer);
    this.notificacaoSubject.next({ tipo, texto });
    this.timer = setTimeout(() => {
      this.fechar();
    }, 4500);
  }
}
