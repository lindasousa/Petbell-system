import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { BottomNavComponent } from './components/bottom-nav/bottom-nav.component';
import { SimuladorPwaComponent } from './components/simulador-pwa/simulador-pwa.component';
import { NotificationService } from './core/services/notification.service';
import { PwaSimulatorService } from './core/services/pwa-simulator.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    BottomNavComponent,
    SimuladorPwaComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'Petbell';
  public modoPwaAtivo: boolean = false;

  constructor(
    public notificationService: NotificationService,
    public pwaService: PwaSimulatorService
  ) {}

  ngOnInit(): void {
    this.modoPwaAtivo = this.pwaService.estaEmModoPwa();
  }
}

