import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {QRMode} from "../../models/Qr.model";

@Component({
  selector: 'app-qr-display',
  standalone: true,
  imports: [],
  templateUrl: './qr-display.component.html',
  styleUrl: './qr-display.component.scss'
})
export class QrDisplayComponent {
  @Input() qrDataUrl = '';
  @Input() isGenerating = false;
  @Input() selectedMode: QRMode | null = null;
  @Output() download = new EventEmitter<void>();

  downloadQR(): void {
    this.download.emit();
  }

  async copyToClipboard(): Promise<void> {
    try {
      const response = await fetch(this.qrDataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      alert('¡QR copiado al portapapeles! 📋✨');
    } catch (error) {
      console.error('Error copiando al portapapeles:', error);
      alert('No se pudo copiar la imagen. Intenta descargarla en su lugar.');
    }
  }
}
