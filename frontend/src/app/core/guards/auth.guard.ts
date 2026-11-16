/**
 * Guards de Protecao de Rotas no Angular
 */

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

/**
 * Guarda rotas que requerem qualquer usuario autenticado
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.estaAutenticado()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};

/**
 * Guarda rotas restritas a ONGs e Administradores (ex: Monitoramento)
 */
export const ongGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  if (authService.isOngOuAdmin()) {
    return true;
  }

  notificationService.erro('Acesso restrito a organizacoes (ONGs) e administradores.');
  router.navigate(['/feed']);
  return false;
};
