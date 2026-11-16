import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertaService } from '../../core/services/alerta.service';
import { NotificationService } from '../../core/services/notification.service';
import { MapaComponent } from '../../components/mapa/mapa.component';

@Component({
  selector: 'app-criar-alerta',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MapaComponent],
  templateUrl: './criar-alerta.component.html',
  styleUrls: ['./criar-alerta.component.css'],
})
export class CriarAlertaComponent {
  public formulario: FormGroup;
  public enviando: boolean = false;
  public previewFoto: string | null = null;
  public capturandoGps: boolean = false;

  constructor(
    private fb: FormBuilder,
    private alertaService: AlertaService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.formulario = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      descricao: ['', [Validators.required, Validators.minLength(10)]],
      localizacao: ['', [Validators.required, Validators.minLength(3)]],
      latitude: [-23.5015, [Validators.required]],
      longitude: [-47.4580, [Validators.required]],
      status_pet: ['ABANDONADO', [Validators.required]],
      foto_url: [''],
      pet_nome: [''],
      pet_especie: ['Canina'],
    });
  }

  public get f() {
    return this.formulario.controls;
  }

  public onCoordenadaSelecionada(coord: { lat: number; lng: number }): void {
    this.formulario.patchValue({
      latitude: Number(coord.lat.toFixed(6)),
      longitude: Number(coord.lng.toFixed(6)),
    });
  }

  public capturarLocalizacaoAtual(): void {
    if (!navigator.geolocation) {
      this.notificationService.erro('Geolocalizacao nao e suportada pelo seu navegador.');
      return;
    }

    this.capturandoGps = true;
    navigator.geolocation.getCurrentPosition(
      (posicao) => {
        const lat = Number(posicao.coords.latitude.toFixed(6));
        const lng = Number(posicao.coords.longitude.toFixed(6));
        this.formulario.patchValue({
          latitude: lat,
          longitude: lng,
          localizacao: 'Localizacao Atual Detectada via GPS, Sorocaba',
        });
        this.capturandoGps = false;
        this.notificationService.sucesso('Coordenadas de GPS capturadas com precisao.');
      },
      (erro) => {
        this.capturandoGps = false;
        this.notificationService.erro('Nao foi possivel obter a localizacao GPS automaticamente.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }

  public aoSelecionarArquivo(evento: any): void {
    const arquivo = evento.target.files[0];
    if (arquivo) {
      const leitor = new FileReader();
      leitor.onload = () => {
        this.previewFoto = leitor.result as string;
        this.formulario.patchValue({ foto_url: this.previewFoto });
      };
      leitor.readAsDataURL(arquivo);
    }
  }

  public submeter(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.notificationService.erro('Por favor, corrija os campos assinalados antes de enviar.');
      return;
    }

    this.enviando = true;
    this.alertaService.criarAlerta(this.formulario.value).subscribe({
      next: (resposta) => {
        this.enviando = false;
        if (resposta.sucesso) {
          this.notificationService.sucesso('Alerta publicado com sucesso!');
          this.router.navigate(['/feed']);
        }
      },
      error: () => {
        this.enviando = false;
      },
    });
  }
}
