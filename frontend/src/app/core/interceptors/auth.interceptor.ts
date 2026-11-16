/**
 * Interceptor HTTP de Autenticacao
 * Anexa o token JWT automaticamente nos cabecalhos das chamadas API.
 */

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.obterToken();

  if (token) {
    const requisicaoClonada = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(requisicaoClonada);
  }

  return next(req);
};
