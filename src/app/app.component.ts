import { Component } from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import { FormsModule } from '@angular/forms';
import QRCode, { QRCodeToDataURLOptions } from 'qrcode';

interface QRMode {
  id: string;
  name: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, NgOptimizedImage],
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

  constructor() {
    this.selectedMode = this.qrModes[0];
  }

  selectMode(mode: QRMode) {
    this.selectedMode = mode;
    if (this.inputText) {
      this.generateQR();
    }
  }

  async generateQR() {
    if (!this.inputText.trim()) {
      this.qrCodeDataUrl = '';
      return;
    }

    this.isGenerating = true;

    try {
      const options = this.getQROptions();
      const dataUrl = await QRCode.toDataURL(this.inputText, options);
      this.qrCodeDataUrl = dataUrl || '';
    } catch (error) {
      console.error('Error generando QR:', error);
      this.qrCodeDataUrl = '';
    } finally {
      setTimeout(() => {
        this.isGenerating = false;
      }, 200);
    }
  }

  getQROptions(): QRCodeToDataURLOptions {
    const baseOptions: QRCodeToDataURLOptions = {
      errorCorrectionLevel: 'H',
      width: 400,
      margin: 2,
    };

    switch (this.selectedMode.id) {
      case 'kiwi':
        return {
          ...baseOptions,
          color: {
            dark: '#3fa05f',  // kiwi-500
            light: '#f4fbf6'  // kiwi-50
          }
        };

      case 'rounded':
        return {
          ...baseOptions,
          color: {
            dark: '#2d7849',  // kiwi-600
            light: '#ffffff'
          }
        };

      case 'dots':
        return {
          ...baseOptions,
          color: {
            dark: '#1e5033',  // kiwi-700
            light: '#e6f6eb'  // kiwi-100
          }
        };

      default: // standard
        return {
          ...baseOptions,
          color: {
            dark: '#000000',
            light: '#ffffff'
          }
        };
    }
  }

  downloadQR() {
    if (!this.qrCodeDataUrl) return;

    const link = document.createElement('a');
    link.href = this.qrCodeDataUrl;
    link.download = `kiwiqr-${this.selectedMode.id}-${Date.now()}.png`;
    link.click();
  }

  clearAll() {
    this.inputText = '';
    this.qrCodeDataUrl = '';
  }
}
