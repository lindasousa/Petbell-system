import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Alerta } from '../../core/models/alerta.model';

// Declaracao global do Leaflet carregado via CDN / Bundle
declare const L: any;

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mapa.component.html',
  styleUrls: ['./mapa.component.css'],
})
export class MapaComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild('mapaContainer', { static: true }) mapaContainer!: ElementRef;

  @Input() alertas: Alerta[] = [];
  @Input() modoSelecao: boolean = false;
  @Input() latitudeInicial: number = -23.5015;
  @Input() longitudeInicial: number = -47.4580;
  @Input() zoomInicial: number = 13;

  @Output() coordenadaSelecionada = new EventEmitter<{ lat: number; lng: number }>();

  private map: any;
  private marcadoresGrupo: any;
  private marcadorSelecao: any;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.inicializarMapa();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['alertas'] && this.map && !this.modoSelecao) {
      this.atualizarMarcadores();
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private inicializarMapa(): void {
    if (typeof L === 'undefined') {
      console.warn('Biblioteca Leaflet ainda nao carregada.');
      return;
    }

    // Criacao do mapa centrado em Sorocaba
    this.map = L.map(this.mapaContainer.nativeElement).setView(
      [this.latitudeInicial, this.longitudeInicial],
      this.zoomInicial
    );

    // Camada de tiles gratuita do OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: 'OpenStreetMap | Petbell Sorocaba',
    }).addTo(this.map);

    this.marcadoresGrupo = L.layerGroup().addTo(this.map);

    if (this.modoSelecao) {
      this.configurarModoSelecao();
    } else {
      this.atualizarMarcadores();
    }
  }

  private configurarModoSelecao(): void {
    // Marcador inicial de selecao
    const iconeSelecao = L.divIcon({
      className: 'custom-pin-selection',
      html: '<div style="background-color:#4e996d; width:22px; height:22px; border-radius:50%; border:3px solid #FFFFFF; box-shadow:0 0 5px rgba(0,0,0,0.5);"></div>',
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });

    this.marcadorSelecao = L.marker([this.latitudeInicial, this.longitudeInicial], {
      icon: iconeSelecao,
      draggable: true,
    }).addTo(this.map);

    this.marcadorSelecao.on('dragend', (e: any) => {
      const pos = e.target.getLatLng();
      this.coordenadaSelecionada.emit({ lat: pos.lat, lng: pos.lng });
    });

    this.map.on('click', (e: any) => {
      const { lat, lng } = e.latlng;
      this.marcadorSelecao.setLatLng([lat, lng]);
      this.coordenadaSelecionada.emit({ lat, lng });
    });
  }

  private atualizarMarcadores(): void {
    if (!this.map || !this.marcadoresGrupo) return;

    this.marcadoresGrupo.clearLayers();

    this.alertas.forEach((alerta) => {
      if (!alerta.latitude || !alerta.longitude) return;

      const corPino = alerta.status_pet === 'RESGATADO' ? '#4e996d' : '#CA8A04';

      const iconeHtml = L.divIcon({
        className: 'custom-pin',
        html: `<div style="background-color:${corPino}; width:18px; height:18px; border-radius:50%; border:2px solid #FFFFFF; box-shadow:0 2px 5px rgba(0,0,0,0.4);"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });

      const marcador = L.marker([alerta.latitude, alerta.longitude], {
        icon: iconeHtml,
        title: alerta.titulo,
      });

      const popupConteudo = `
        <div style="font-family: sans-serif; font-size: 14px; min-width: 160px;">
          <strong style="color: #1E293B; font-size: 15px;">${alerta.titulo}</strong>
          <div style="margin: 4px 0; color: #64748B; font-size: 12px;">Local: ${alerta.localizacao}</div>
          <div style="margin-bottom: 8px; font-weight: bold; color: ${corPino}; font-size: 12px;">Status: ${alerta.status_pet}</div>
          <button id="btn-popup-${alerta.id}" style="width:100%; min-height:36px; background:#4e996d; color:#fff; border:none; border-radius:4px; font-weight:bold; cursor:pointer;">
            Ver Ocorrencia
          </button>
        </div>
      `;

      marcador.bindPopup(popupConteudo);

      marcador.on('popupopen', () => {
        const btn = document.getElementById(`btn-popup-${alerta.id}`);
        if (btn) {
          btn.onclick = () => {
            this.router.navigate(['/alerta', alerta.id]);
          };
        }
      });

      this.marcadoresGrupo.addLayer(marcador);
    });
  }
}
