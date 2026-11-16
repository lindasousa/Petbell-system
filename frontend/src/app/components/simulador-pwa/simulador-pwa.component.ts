import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PwaSimulatorService } from '../../core/services/pwa-simulator.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-simulador-pwa',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './simulador-pwa.component.html',
  styleUrls: ['./simulador-pwa.component.css'],
})
export class SimuladorPwaComponent implements OnInit, OnDestroy {
  public visivel: boolean = false;
  public urlIframe: SafeResourceUrl | null = null;
  private sub: Subscription | null = null;

  constructor(
    public pwaService: PwaSimulatorService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.sub = this.pwaService.simuladorAberto$.subscribe((aberto) => {
      this.visivel = aberto;
      if (aberto && !this.urlIframe) {
        // Aponta para a aplicacao em modo PWA celular
        const urlCompleta = `${window.location.origin}/feed?modo=pwa`;
        this.urlIframe = this.sanitizer.bypassSecurityTrustResourceUrl(urlCompleta);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  public fechar(): void {
    this.pwaService.fecharSimulador();
  }

  public abrirEmNovaJanela(): void {
    this.pwaService.abrirEmJanelaPopup();
    this.fechar();
  }
}
