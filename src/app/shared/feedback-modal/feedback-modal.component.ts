import { Component, inject, Input } from '@angular/core';
import { ToastService } from '../../core/services/toast.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-feedback-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './feedback-modal.component.html',
  styleUrls: ['./feedback-modal.component.scss'],
})
export class FeedbackModalComponent {
  @Input() message = '';
  @Input() type: 'success' | 'error' | 'info' = 'success';
  @Input() confirmCallback?: () => void;
  @Input() confirmButtons = false;

  private toastService = inject(ToastService);

  close(): void {
    this.toastService.hideModal();
  }

  confirm(): void {
    if (this.confirmCallback) this.confirmCallback();
    this.close();
  }
}
