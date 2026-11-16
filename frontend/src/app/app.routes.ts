/**
 * Configuracao de Rotas do Sistema Petbell
 */

import { Routes } from '@angular/router';
import { FeedComponent } from './pages/feed/feed.component';
import { CriarAlertaComponent } from './pages/criar-alerta/criar-alerta.component';
import { DetalhesAlertaComponent } from './pages/detalhes-alerta/detalhes-alerta.component';
import { LoginComponent } from './pages/login/login.component';
import { CadastroComponent } from './pages/cadastro/cadastro.component';
import { DoacoesComponent } from './pages/doacoes/doacoes.component';
import { MonitoramentoComponent } from './pages/monitoramento/monitoramento.component';
import { PerfilComponent } from './pages/perfil/perfil.component';
import { authGuard, ongGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'feed', pathMatch: 'full' },
  { path: 'feed', component: FeedComponent },
  { path: 'criar-alerta', component: CriarAlertaComponent },
  { path: 'alerta/:id', component: DetalhesAlertaComponent },
  { path: 'login', component: LoginComponent },
  { path: 'cadastro', component: CadastroComponent },
  { path: 'doacoes', component: DoacoesComponent },
  // Area restrita a ONGs e Administradores com verificacao de papel (RBAC)
  { path: 'monitoramento', component: MonitoramentoComponent, canActivate: [ongGuard] },
  // Area restrita a usuarios autenticados
  { path: 'perfil', component: PerfilComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'feed' },
];
