/**
 * Interceptor HTTP de Tratamento de Erros
 * Captura codigos de erro da API e exibe feedbacks amigaveis na interface.
 */

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let mensagemErro = 'Ocorreu um erro na comunicacao com o servidor.';

      if (error.error && error.error.mensagem) {
        mensagemErro = error.error.mensagem;
      } else if (error.status === 401) {
        mensagemErro = 'Acesso nao autorizado ou sessao expirada. Faca login novamente.';
        authService.logout();
      } else if (error.status === 403) {
        mensagemErro = 'Voce nao possui permissao para executar esta acao.';
      } else if (error.status === 429) {
        mensagemErro = 'Muitas requisicoes consecutivas. Aguarde alguns minutos.';
      } else if (error.status === 0) {
        mensagemErro = 'Nao foi possivel conectar ao servidor da API Petbell (localhost:3000).';
      }

      notificationService.erro(mensagemErro);
      return throwError(() => error);
    })
  );
};
