import { Injectable, inject } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Router } from '@angular/router';
import { FeedbackModalComponent } from '../../shared/feedback-modal/feedback-modal.component';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private bsModalRef?: BsModalRef;
  private modalService = inject(BsModalService);
  private router = inject(Router);

  /**
   * Exibe modal de feedback
   * @param message mensagem a exibir
   * @param type tipo do modal: 'success' | 'error' | 'info'
   * @param redirectTo rota para redirecionar após fechar (opcional)
   * @param duration tempo em ms antes de fechar automaticamente (0 = não fecha)
   * @param confirmCallback callback chamado ao clicar em "Sim" (somente para info)
   */
  showModal(
    message: string,
    type: 'success' | 'error' | 'info' = 'success',
    redirectTo?: string,
    duration = 2000,
    confirmCallback?: () => void
  ) {
    this.bsModalRef = this.modalService.show(FeedbackModalComponent, {
      initialState: { 
        message, 
        type,
        confirmCallback,
        confirmButtons: !!confirmCallback
      },
      class: 'modal-dialog-centered',
    });

    if (duration > 0) {
      const timeout = setTimeout(() => this.bsModalRef?.hide(), duration);
      this.bsModalRef.onHide?.subscribe(() => clearTimeout(timeout));
    }

    this.bsModalRef.onHide?.subscribe(() => {
      if (redirectTo && !confirmCallback) {
        this.router.navigate([redirectTo]);
      }
    });
  }

  hideModal(): void {
    this.bsModalRef?.hide();
  }

  success(message: string, redirectTo?: string, duration = 2000) {
    this.showModal(message, 'success', redirectTo, duration);
  }

  error(message: string, redirectTo?: string, duration = 0) {
    this.showModal(message, 'error', redirectTo, duration);
  }

  info(message: string, confirmCallback?: () => void, duration = 0) {
    this.showModal(message, 'info', undefined, duration, confirmCallback);
  }
}
