/**
 * Servico de Simulacao e Instalacao do PWA
 * Gerencia o prompt de instalacao nativo e a exibicao do simulador de smartphone
 * para fins de demonstracao e avaliacao academica.
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PwaSimulatorService {
  private simuladorAbertoSubject = new BehaviorSubject<boolean>(false);
  public simuladorAberto$ = this.simuladorAbertoSubject.asObservable();

  private eventoInstalacaoNativa: any = null;
  private podeInstalarNativoSubject = new BehaviorSubject<boolean>(false);
  public podeInstalarNativo$ = this.podeInstalarNativoSubject.asObservable();

  constructor() {
    this.ouvirEventoInstalacaoNativa();
  }

  private ouvirEventoInstalacaoNativa(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeinstallprompt', (evento: any) => {
        evento.preventDefault();
        this.eventoInstalacaoNativa = evento;
        this.podeInstalarNativoSubject.next(true);
      });
    }
  }

  public abrirSimulador(): void {
    this.simuladorAbertoSubject.next(true);
  }

  public fecharSimulador(): void {
    this.simuladorAbertoSubject.next(false);
  }

  /**
   * Dispara a instalacao nativa do PWA caso o navegador suporte,
   * ou abre o simulador de smartphone interativo.
   */
  public acionarInstalacaoOuSimulador(): void {
    if (this.eventoInstalacaoNativa) {
      this.eventoInstalacaoNativa.prompt();
      this.eventoInstalacaoNativa.userChoice.then((resultado: any) => {
        if (resultado.outcome === 'accepted') {
          console.log('Usuario aceitou instalar o PWA.');
        }
        this.eventoInstalacaoNativa = null;
        this.podeInstalarNativoSubject.next(false);
      });
    } else {
      // Abre o simulador de smartphone com a versao celular para avaliacao no PC
      this.abrirSimulador();
    }
  }

  /**
   * Abre uma janela de navegador separada simulando as dimensoes exatas de um smartphone.
   */
  public abrirEmJanelaPopup(): void {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}${window.location.pathname}?modo=pwa`;
      window.open(
        url,
        'PetbellPWA',
        'width=420,height=820,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes'
      );
    }
  }

  /**
   * Identifica se a aplicacao esta rodando dentro da simulacao mobile ou janela popup
   */
  public estaEmModoPwa(): boolean {
    if (typeof window === 'undefined') return false;
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('modo') === 'pwa' || window.matchMedia('(display-mode: standalone)').matches;
  }
}
