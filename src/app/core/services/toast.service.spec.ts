import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { FeedbackModalComponent } from '../../shared/feedback-modal/feedback-modal.component';
import { EventEmitter } from '@angular/core';

describe('ToastService', () => {
  let service: ToastService;
  let modalService: jasmine.SpyObj<BsModalService>;
  let router: jasmine.SpyObj<Router>;
  let mockModalRef: Partial<BsModalRef>;

  beforeEach(() => {
    mockModalRef = {
      onHide: new EventEmitter<void>() as any,
      hide: jasmine.createSpy('hide'),
    };

    modalService = jasmine.createSpyObj('BsModalService', ['show']);
    modalService.show.and.returnValue(mockModalRef as BsModalRef);

    router = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        ToastService,
        { provide: BsModalService, useValue: modalService },
        { provide: Router, useValue: router },
      ],
    });

    service = TestBed.inject(ToastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should show success modal and auto-hide', (done) => {
    service.success('Success message', '/home', 10);

    expect(modalService.show).toHaveBeenCalledWith(FeedbackModalComponent, jasmine.objectContaining({
      initialState: jasmine.objectContaining({
        message: 'Success message',
        type: 'success',
        confirmButtons: false
      }),
      class: 'modal-dialog-centered'
    }));

    setTimeout(() => {
      expect(mockModalRef.hide).toHaveBeenCalled();
      done();
    }, 20);

  });

  it('should navigate to redirectTo if provided and no confirmCallback', () => {
    service.success('Message', '/home', 0);
    
    (mockModalRef.onHide as EventEmitter<void>).emit();
    expect(router.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('should not navigate if confirmCallback is provided', () => {
    const callback = jasmine.createSpy('callback');
    service.info('Info message', callback, 0);

   (mockModalRef.onHide as EventEmitter<void>).emit();

    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should call info modal with confirmCallback', () => {
    const callback = jasmine.createSpy('callback');
    service.info('Info message', callback, 0);

    expect(modalService.show).toHaveBeenCalledWith(FeedbackModalComponent, jasmine.objectContaining({
      initialState: jasmine.objectContaining({
        message: 'Info message',
        type: 'info',
        confirmCallback: callback,
        confirmButtons: true
      }),
      class: 'modal-dialog-centered'
    }));
  });

  it('should show error modal with correct parameters', () => {
    service.error('An error occurred');

    expect(modalService.show).toHaveBeenCalledWith(FeedbackModalComponent, jasmine.objectContaining({
      initialState: jasmine.objectContaining({
        message: 'An error occurred',
        type: 'error',
        confirmButtons: false
      }),
      class: 'modal-dialog-centered'
    }));
  });

  it('should call hideModal', () => {
    service.success('Hide test', undefined, 0);
    service.hideModal();
    expect(mockModalRef.hide).toHaveBeenCalled();
  });

});
