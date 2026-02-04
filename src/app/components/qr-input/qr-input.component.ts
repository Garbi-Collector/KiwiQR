import { Component, EventEmitter, Output, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-qr-input',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './qr-input.component.html',
  styleUrl: './qr-input.component.scss'
})
export class QrInputComponent {
  @Input() inputValue = '';
  @Output() inputValueChange = new EventEmitter<string>();
  @Output() clearRequested = new EventEmitter<void>();

  onInputChange(): void {
    this.inputValueChange.emit(this.inputValue);
  }

  clearInput(): void {
    this.inputValue = '';
    this.clearRequested.emit();
  }
}
