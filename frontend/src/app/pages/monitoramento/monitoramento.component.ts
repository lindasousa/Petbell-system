import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AlertaService } from '../../core/services/alerta.service';
import { NotificationService } from '../../core/services/notification.service';
import { Alerta, StatusPet } from '../../core/models/alerta.model';

@Component({
  selector: 'app-monitoramento',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './monitoramento.component.html',
  styleUrls: ['./monitoramento.component.css'],
})
export class MonitoramentoComponent implements OnInit {
  public estatisticas: any = null;
  public alertas: Alerta[] = [];
  public carregando: boolean = true;
  public atualizandoId: number | null = null;

  constructor(
    private alertaService: AlertaService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.carregarDadosPainel();
  }

  public carregarDadosPainel(): void {
    this.carregando = true;
    this.alertaService.obterEstatisticas().subscribe({
      next: (respStats) => {
        if (respStats.sucesso) {
          this.estatisticas = respStats.dados;
        }

        this.alertaService.listarAlertas({ limite: 50 }).subscribe({
          next: (respAlertas) => {
            if (respAlertas.sucesso && respAlertas.dados) {
              this.alertas = respAlertas.dados;
            }
            this.carregando = false;
          },
          error: () => {
            this.carregando = false;
          },
        });
      },
      error: () => {
        this.carregando = false;
      },
    });
  }

  public alterarStatusDireto(alerta: Alerta, novoStatus: StatusPet): void {
    this.atualizandoId = alerta.id;
    this.alertaService.atualizarStatus(alerta.id, novoStatus).subscribe({
      next: (resposta) => {
        this.atualizandoId = null;
        if (resposta.sucesso) {
          alerta.status_pet = novoStatus;
          this.notificationService.sucesso(`Status do alerta #${alerta.id} alterado com sucesso.`);
          this.recalcularEstatisticasLocais();
        }
      },
      error: () => {
        this.atualizandoId = null;
      },
    });
  }

  private recalcularEstatisticasLocais(): void {
    if (!this.estatisticas) return;
    this.estatisticas.resgatados = this.alertas.filter((a) => a.status_pet === 'RESGATADO').length;
    this.estatisticas.adotados = this.alertas.filter((a) => a.status_pet === 'ADOTADO').length;
  }
}
