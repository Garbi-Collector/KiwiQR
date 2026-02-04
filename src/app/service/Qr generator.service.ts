import { Injectable } from '@angular/core';
import QRCode, { QRCodeToDataURLOptions } from 'qrcode';
import {QRColorScheme, QRGenerateOptions, QRModeType} from "../models/Qr.model";

@Injectable({
  providedIn: 'root'
})
export class QrGeneratorService {

  private readonly colorSchemes: Record<QRModeType, QRColorScheme> = {
    standard: { dark: '#000000', light: '#ffffff' },
    kiwi: { dark: '#3fa05f', light: '#f4fbf6' },
    rounded: { dark: '#2d7849', light: '#ffffff' },
    dots: { dark: '#1e5033', light: '#e6f6eb' }
  };

  async generateQR(options: QRGenerateOptions): Promise<string> {
    const { text, mode, size = 400, margin = 2 } = options;

    if (!text.trim()) {
      return '';
    }

    try {
      // Para los modos especiales (rounded, dots), usamos canvas custom
      if (mode === 'rounded' || mode === 'dots') {
        return await this.generateCustomStyleQR(text, mode, size, margin);
      }

      // Para standard y kiwi, usamos la librería directamente
      const qrOptions = this.getQROptions(mode, size, margin);
      return await QRCode.toDataURL(text, qrOptions);
    } catch (error) {
      console.error('Error generando QR:', error);
      throw error;
    }
  }

  private getQROptions(mode: QRModeType, size: number, margin: number): QRCodeToDataURLOptions {
    const colors = this.colorSchemes[mode];
    return {
      errorCorrectionLevel: 'H',
      width: size,
      margin: margin,
      color: colors
    };
  }

  private async generateCustomStyleQR(
    text: string,
    mode: QRModeType,
    size: number,
    margin: number
  ): Promise<string> {
    // Primero generamos el QR base
    const baseOptions: QRCodeToDataURLOptions = {
      errorCorrectionLevel: 'H',
      width: size,
      margin: margin,
      color: this.colorSchemes[mode]
    };

    // Generamos la matriz QR
    const qrMatrix = await QRCode.create(text, { errorCorrectionLevel: 'H' });
    const modules = qrMatrix.modules;
    const moduleCount = modules.size;

    // Creamos un canvas para dibujar el QR custom
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No se pudo obtener el contexto del canvas');

    const pixelSize = Math.floor(size / (moduleCount + margin * 2));
    const actualSize = pixelSize * (moduleCount + margin * 2);
    canvas.width = actualSize;
    canvas.height = actualSize;

    const colors = this.colorSchemes[mode];

    // Fondo
    ctx.fillStyle = colors.light;
    ctx.fillRect(0, 0, actualSize, actualSize);

    const offset = margin * pixelSize;

    // Dibujamos según el estilo
    if (mode === 'rounded') {
      this.drawRoundedQR(ctx, modules, moduleCount, pixelSize, offset, colors.dark);
    } else if (mode === 'dots') {
      this.drawDotsQR(ctx, modules, moduleCount, pixelSize, offset, colors.dark);
    }

    return canvas.toDataURL('image/png');
  }

  private drawRoundedQR(
    ctx: CanvasRenderingContext2D,
    modules: any,
    moduleCount: number,
    pixelSize: number,
    offset: number,
    color: string
  ): void {
    ctx.fillStyle = color;
    const cornerRadius = pixelSize * 0.4; // 40% de radio para suavidad

    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (modules.get(row, col)) {
          const x = offset + col * pixelSize;
          const y = offset + row * pixelSize;

          // Verificar módulos adyacentes para conectar mejor
          const hasTop = row > 0 && modules.get(row - 1, col);
          const hasRight = col < moduleCount - 1 && modules.get(row, col + 1);
          const hasBottom = row < moduleCount - 1 && modules.get(row + 1, col);
          const hasLeft = col > 0 && modules.get(row, col - 1);

          this.drawRoundedRect(
            ctx, x, y, pixelSize, pixelSize, cornerRadius,
            hasTop, hasRight, hasBottom, hasLeft
          );
        }
      }
    }
  }

  private drawRoundedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
    hasTop: boolean,
    hasRight: boolean,
    hasBottom: boolean,
    hasLeft: boolean
  ): void {
    ctx.beginPath();

    // Top-left corner
    if (hasTop && hasLeft) {
      ctx.moveTo(x, y);
    } else if (hasTop) {
      ctx.moveTo(x, y);
      ctx.lineTo(x + radius, y);
    } else if (hasLeft) {
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + radius);
    } else {
      ctx.moveTo(x + radius, y);
      ctx.arcTo(x, y, x, y + radius, radius);
    }

    // Top-right corner
    if (hasTop && hasRight) {
      ctx.lineTo(x + width, y);
    } else if (hasTop) {
      ctx.lineTo(x + width - radius, y);
      ctx.arcTo(x + width, y, x + width, y + radius, radius);
    } else if (hasRight) {
      ctx.lineTo(x + width, y);
    } else {
      ctx.lineTo(x + width - radius, y);
      ctx.arcTo(x + width, y, x + width, y + radius, radius);
    }

    // Bottom-right corner
    if (hasBottom && hasRight) {
      ctx.lineTo(x + width, y + height);
    } else if (hasBottom) {
      ctx.lineTo(x + width, y + height - radius);
      ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
    } else if (hasRight) {
      ctx.lineTo(x + width, y + height);
    } else {
      ctx.lineTo(x + width, y + height - radius);
      ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
    }

    // Bottom-left corner
    if (hasBottom && hasLeft) {
      ctx.lineTo(x, y + height);
    } else if (hasBottom) {
      ctx.lineTo(x + radius, y + height);
      ctx.arcTo(x, y + height, x, y + height - radius, radius);
    } else if (hasLeft) {
      ctx.lineTo(x, y + height);
    } else {
      ctx.lineTo(x + radius, y + height);
      ctx.arcTo(x, y + height, x, y + height - radius, radius);
    }

    ctx.closePath();
    ctx.fill();
  }

  private drawDotsQR(
    ctx: CanvasRenderingContext2D,
    modules: any,
    moduleCount: number,
    pixelSize: number,
    offset: number,
    color: string
  ): void {
    ctx.fillStyle = color;
    const dotRadius = pixelSize * 0.45; // 45% del tamaño del píxel

    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (modules.get(row, col)) {
          const centerX = offset + col * pixelSize + pixelSize / 2;
          const centerY = offset + row * pixelSize + pixelSize / 2;

          // Verificar si es parte de los marcadores de posición (esquinas)
          const isPositionMarker = this.isInPositionMarker(row, col, moduleCount);

          if (isPositionMarker) {
            // Para los marcadores de posición, dibujamos cuadrados redondeados
            const x = offset + col * pixelSize;
            const y = offset + row * pixelSize;
            const cornerRadius = pixelSize * 0.3;

            ctx.beginPath();
            ctx.moveTo(x + cornerRadius, y);
            ctx.lineTo(x + pixelSize - cornerRadius, y);
            ctx.arcTo(x + pixelSize, y, x + pixelSize, y + cornerRadius, cornerRadius);
            ctx.lineTo(x + pixelSize, y + pixelSize - cornerRadius);
            ctx.arcTo(x + pixelSize, y + pixelSize, x + pixelSize - cornerRadius, y + pixelSize, cornerRadius);
            ctx.lineTo(x + cornerRadius, y + pixelSize);
            ctx.arcTo(x, y + pixelSize, x, y + pixelSize - cornerRadius, cornerRadius);
            ctx.lineTo(x, y + cornerRadius);
            ctx.arcTo(x, y, x + cornerRadius, y, cornerRadius);
            ctx.closePath();
            ctx.fill();
          } else {
            // Para el resto, dibujamos círculos
            ctx.beginPath();
            ctx.arc(centerX, centerY, dotRadius, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }
  }

  private isInPositionMarker(row: number, col: number, moduleCount: number): boolean {
    // Top-left marker (7x7)
    if (row < 7 && col < 7) return true;
    // Top-right marker
    if (row < 7 && col >= moduleCount - 7) return true;
    // Bottom-left marker
    if (row >= moduleCount - 7 && col < 7) return true;
    return false;
  }

  getColorScheme(mode: QRModeType): QRColorScheme {
    return this.colorSchemes[mode];
  }
}
