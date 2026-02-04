import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {QRMode} from "../../models/Qr.model";

@Component({
  selector: 'app-mode-selector',
  standalone: true,
  imports: [],
  templateUrl: './mode-selector.component.html',
  styleUrl: './mode-selector.component.scss'
})
export class ModeSelectorComponent {
  @Input() modes: QRMode[] = [];
  @Input() selectedMode: QRMode | null = null;
  @Output() modeSelected = new EventEmitter<QRMode>();

  selectMode(mode: QRMode): void {
    this.modeSelected.emit(mode);
  }
}
