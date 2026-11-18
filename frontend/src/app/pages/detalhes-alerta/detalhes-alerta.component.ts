import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AlertaService } from '../../core/services/alerta.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { Alerta, MensagemComunidade, StatusPet } from '../../core/models/alerta.model';

@Component({
  selector: 'app-detalhes-alerta',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './detalhes-alerta.component.html',
  styleUrls: ['./detalhes-alerta.component.css'],
})
export class DetalhesAlertaComponent implements OnInit {
  public alerta: Alerta | null = null;
  public carregando: boolean = true;
  public novoStatus: StatusPet = 'RESGATADO';
  public atualizandoStatus: boolean = false;

  // Chat Comunitario
  public mensagens: MensagemComunidade[] = [];
  public textoNovaMensagem: string = '';
  public nomeAutorAnonimo: string = '';
  public enviandoMensagem: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private alertaService: AlertaService,
    public authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.carregarDadosAlerta(id);
    }
  }

  public carregarDadosAlerta(id: string): void {
    this.carregando = true;
    this.alertaService.buscarPorId(id).subscribe({
      next: (resposta) => {
        if (resposta.sucesso && resposta.dados) {
          this.alerta = resposta.dados;
          this.mensagens = resposta.dados.mensagens || [];
          this.novoStatus = this.alerta.status_pet;
        }
        this.carregando = false;
      },
      error: () => {
        this.carregando = false;
      },
    });
  }

  public podeAlterarStatus(): boolean {
    if (!this.authService.estaAutenticado() || !this.alerta) return false;
    const usuario = this.authService.getUsuarioAtual();
    if (!usuario) return false;

    // ONGs e Administradores podem alterar qualquer alerta
    if (usuario.tipo === 'ong' || usuario.tipo === 'administrador') return true;

    // Cidadao pode alterar se for o autor da ocorrencia
    return this.alerta.usuario_id === usuario.id;
  }

  public salvarNovoStatus(status: StatusPet): void {
    if (!this.alerta) return;

    this.atualizandoStatus = true;
    this.alertaService.atualizarStatus(this.alerta.id, status).subscribe({
      next: (resposta) => {
        this.atualizandoStatus = false;
        if (resposta.sucesso && this.alerta) {
          this.alerta.status_pet = status;
          this.notificationService.sucesso(`Status atualizado para ${status} com sucesso!`);
        }
      },
      error: () => {
        this.atualizandoStatus = false;
      },
    });
  }

  public enviarMensagemChat(): void {
    if (!this.alerta || !this.textoNovaMensagem.trim()) return;

    this.enviandoMensagem = true;
    this.alertaService
      .enviarMensagem(this.alerta.id, this.textoNovaMensagem.trim(), this.nomeAutorAnonimo.trim())
      .subscribe({
        next: (resposta) => {
          this.enviandoMensagem = false;
          if (resposta.sucesso && resposta.dados) {
            this.mensagens.push(resposta.dados);
            this.textoNovaMensagem = '';
            this.notificationService.sucesso('Mensagem publicada no chat comunitario.');
          }
        },
        error: () => {
          this.enviandoMensagem = false;
        },
      });
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
}
