import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.css'],
})
export class CadastroComponent {
  public formulario: FormGroup;
  public cadastrando: boolean = false;
  public mensagemErroServidor: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.formulario = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(120)]],
      tipo: ['cidadao', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
      telefone: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20)]],
    });
  }

  public get f() {
    return this.formulario.controls;
  }

  public submeter(): void {
    this.mensagemErroServidor = null;

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.notificationService.erro('Por favor, preencha todos os campos obrigatorios corretamente.');
      return;
    }

    this.cadastrando = true;
    this.authService.cadastrar(this.formulario.value).subscribe({
      next: (resposta) => {
        this.cadastrando = false;
        if (resposta.sucesso) {
          this.notificationService.sucesso('Cadastro realizado com sucesso! Bem-vindo ao Petbell.');
          if (this.formulario.value.tipo === 'ong') {
            this.router.navigate(['/monitoramento']);
          } else {
            this.router.navigate(['/feed']);
          }
        }
      },
      error: (err) => {
        this.cadastrando = false;
        if (err.error && err.error.mensagem) {
          this.mensagemErroServidor = err.error.mensagem;
        } else {
          this.mensagemErroServidor = 'Nao foi possivel concluir o cadastro. Verifique os dados fornecidos.';
        }
      },
    });
  }
}
