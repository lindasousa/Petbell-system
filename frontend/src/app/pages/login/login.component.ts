import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  public formulario: FormGroup;
  public tipoSelecionado: 'cidadao' | 'ong' = 'cidadao';
  public processando: boolean = false;
  public mensagemErroServidor: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.formulario = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  public get f() {
    return this.formulario.controls;
  }

  public alternarTipo(tipo: 'cidadao' | 'ong'): void {
    this.tipoSelecionado = tipo;
    this.mensagemErroServidor = null;
  }

  public submeter(): void {
    this.mensagemErroServidor = null;

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.processando = true;
    this.authService.login(this.formulario.value).subscribe({
      next: (resposta) => {
        this.processando = false;
        if (resposta.sucesso) {
          this.notificationService.sucesso('Login realizado com sucesso!');
          if (this.authService.isOngOuAdmin()) {
            this.router.navigate(['/monitoramento']);
          } else {
            this.router.navigate(['/feed']);
          }
        }
      },
      error: (err) => {
        this.processando = false;
        if (err.error && err.error.mensagem) {
          this.mensagemErroServidor = err.error.mensagem;
        } else if (err.status === 401) {
          this.mensagemErroServidor = 'Credenciais invalidas. Verifique seu e-mail e senha.';
        } else {
          this.mensagemErroServidor = 'Falha ao autenticar. Verifique sua conexao.';
        }
      },
    });
  }
}
