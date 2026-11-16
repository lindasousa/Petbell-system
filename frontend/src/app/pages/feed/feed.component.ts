import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AlertaService } from '../../core/services/alerta.service';
import { Alerta, StatusPet } from '../../core/models/alerta.model';
import { MapaComponent } from '../../components/mapa/mapa.component';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MapaComponent],
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css'],
})
export class FeedComponent implements OnInit {
  public alertas: Alerta[] = [];
  public carregando: boolean = true;
  public statusSelecionado: string = 'TODOS';
  public termoBusca: string = '';
  public exibirMapa: boolean = true;

  public totalTodos: number = 0;
  public totalPerdidos: number = 0;
  public totalResgatados: number = 0;

  constructor(private alertaService: AlertaService) {}

  ngOnInit(): void {
    this.carregarAlertas();
  }

  public carregarAlertas(): void {
    this.carregando = true;
    this.alertaService
      .listarAlertas({
        status: this.statusSelecionado,
        busca: this.termoBusca,
        limite: 50,
      })
      .subscribe({
        next: (resposta) => {
          if (resposta.sucesso && resposta.dados) {
            this.alertas = resposta.dados;
            this.calcularTotais();
          }
          this.carregando = false;
        },
        error: () => {
          this.carregando = false;
        },
      });
  }

  public selecionarFiltro(status: string): void {
    this.statusSelecionado = status;
    this.carregarAlertas();
  }

  public alternarVisualizacaoMapa(): void {
    this.exibirMapa = !this.exibirMapa;
  }

  private calcularTotais(): void {
    this.totalTodos = this.alertas.length;
    this.totalPerdidos = this.alertas.filter((a) => a.status_pet === 'PERDI_MEU_PET').length;
    this.totalResgatados = this.alertas.filter((a) => a.status_pet === 'RESGATADO').length;
  }

  public obterClasseBadge(status: StatusPet): string {
    switch (status) {
      case 'RESGATADO':
        return 'badge-success';
      case 'PERDI_MEU_PET':
      case 'ABANDONADO':
        return 'badge-warn';
      case 'ADOCAO':
        return 'badge-neutral';
      case 'ADOTADO':
        return 'badge-success';
      default:
        return 'badge-warn';
    }
  }

  public formatarRotuloStatus(status: StatusPet): string {
    switch (status) {
      case 'PERDI_MEU_PET':
        return 'PERDIDO';
      case 'RESGATADO':
        return 'RESGATADO';
      case 'ADOCAO':
        return 'ADOCAO';
      case 'ADOTADO':
        return 'ADOTADO';
      case 'ABANDONADO':
        return 'ABANDONADO';
      default:
        return status;
    }
  }
}
