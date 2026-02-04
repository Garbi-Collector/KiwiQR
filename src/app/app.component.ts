import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { QrInputComponent } from './components/qr-input/qr-input.component';
import { ModeSelectorComponent } from './components/mode-selector/mode-selector.component';
import { QrDisplayComponent } from './components/qr-display/qr-display.component';
import {QRMode} from "./models/Qr.model";
import {QrGeneratorService} from "./service/Qr generator.service";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    QrInputComponent,
    ModeSelectorComponent,
    QrDisplayComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'KiwiQR';
  inputText = '';
  qrCodeDataUrl = '';
  isGenerating = false;
  selectedMode: QRMode;

  qrModes: QRMode[] = [
    {
      id: 'standard',
      name: 'Estándar',
      icon: '📱',
      description: 'QR clásico en blanco y negro'
    },
    {
      id: 'kiwi',
      name: 'Kiwi Style',
      icon: '🥝',
      description: 'QR con colores Kiwi'
    },
    {
      id: 'rounded',
      name: 'Redondeado',
      icon: '⚪',
      description: 'Bordes suaves y redondeados'
    },
    {
      id: 'dots',
      name: 'Puntos',
      icon: '⚫',
      description: 'Estilo de puntos circulares'
    }
  ];

  constructor(private qrService: QrGeneratorService) {
    this.selectedMode = this.qrModes[0];
  }

  async onInputChange(text: string): Promise<void> {
    this.inputText = text;
    await this.generateQR();
  }

  async onModeSelected(mode: QRMode): Promise<void> {
    this.selectedMode = mode;
    if (this.inputText) {
      await this.generateQR();
    }
  }

  async generateQR(): Promise<void> {
    if (!this.inputText.trim()) {
      this.qrCodeDataUrl = '';
      return;
    }

    this.isGenerating = true;

    try {
      const dataUrl = await this.qrService.generateQR({
        text: this.inputText,
        mode: this.selectedMode.id,
        size: 400,
        margin: 2
      });
      this.qrCodeDataUrl = dataUrl;
    } catch (error) {
      console.error('Error generando QR:', error);
      this.qrCodeDataUrl = '';
    } finally {
      setTimeout(() => {
        this.isGenerating = false;
      }, 200);
    }
  }

  downloadQR(): void {
    if (!this.qrCodeDataUrl) return;

    const link = document.createElement('a');
    link.href = this.qrCodeDataUrl;
    link.download = `kiwiqr-${this.selectedMode.id}-${Date.now()}.png`;
    link.click();
  }

  clearAll(): void {
    this.inputText = '';
    this.qrCodeDataUrl = '';
  }
}
