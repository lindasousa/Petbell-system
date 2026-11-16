import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AlertaService } from '../../core/services/alerta.service';
import { NotificationService } from '../../core/services/notification.service';
import { Usuario, Alerta, StatusPet } from '../../core/models/alerta.model';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css'],
})
export class PerfilComponent implements OnInit {
  public usuario: Usuario | null = null;
  public meusAlertas: Alerta[] = [];
  public carregando: boolean = true;

  constructor(
    public authService: AuthService,
    private alertaService: AlertaService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.carregarDadosPerfil();
  }

  public carregarDadosPerfil(): void {
    this.carregando = true;
    this.authService.carregarPerfil().subscribe({
      next: (resposta) => {
        if (resposta.sucesso && resposta.dados) {
          this.usuario = resposta.dados;
          this.meusAlertas = resposta.dados.alertas || [];
        }
        this.carregando = false;
      },
      error: () => {
        this.carregando = false;
      },
    });
  }

  public marcarComoResolvido(alerta: Alerta): void {
    const novoStatus: StatusPet = 'RESGATADO';
    this.alertaService.atualizarStatus(alerta.id, novoStatus).subscribe({
      next: (resposta) => {
        if (resposta.sucesso) {
          alerta.status_pet = novoStatus;
          this.notificationService.sucesso('Seu alerta foi marcado como RESGATADO!');
        }
      },
    });
  }

  public logout(): void {
    this.authService.logout();
  }
}
