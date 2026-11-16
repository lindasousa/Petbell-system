import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertaService } from '../../core/services/alerta.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-doacoes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './doacoes.component.html',
  styleUrls: ['./doacoes.component.css'],
})
export class DoacoesComponent implements OnInit {
  public campanhas: any[] = [];
  public carregando: boolean = true;
  public chaveCopiadaId: number | null = null;

  constructor(
    private alertaService: AlertaService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.carregarDoacoes();
  }

  public carregarDoacoes(): void {
    this.carregando = true;
    this.alertaService.obterDoacoes().subscribe({
      next: (resposta) => {
        if (resposta.sucesso && resposta.dados) {
          this.campanhas = resposta.dados;
        }
        this.carregando = false;
      },
      error: () => {
        this.carregando = false;
      },
    });
  }

  public copiarChavePix(campanha: any): void {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(campanha.chave_pix).then(() => {
        this.chaveCopiadaId = campanha.id;
        this.notificationService.sucesso('Chave PIX ficticia copiada para a area de transferencia.');
        setTimeout(() => {
          this.chaveCopiadaId = null;
        }, 3000);
      });
    } else {
      this.notificationService.info(`Chave ficticia: ${campanha.chave_pix}`);
    }
  }
}
