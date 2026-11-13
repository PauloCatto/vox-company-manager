import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeedbackModalComponent } from './feedback-modal.component';
import { ToastService } from '../../core/services/toast.service';

const toastServiceMock = {
  hideModal: jasmine.createSpy('hideModal'),
};

describe('FeedbackModalComponent', () => {
  let component: FeedbackModalComponent;
  let fixture: ComponentFixture<FeedbackModalComponent>;
  let toastService: ToastService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedbackModalComponent],
      providers: [{ provide: ToastService, useValue: toastServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(FeedbackModalComponent);
    component = fixture.componentInstance;
    toastService = TestBed.inject(ToastService);
  });

  afterEach(() => {
    toastServiceMock.hideModal.calls.reset();
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display the correct message and icon for success type', () => {
    component.message = 'Success!';
    component.type = 'success';
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.modal-body p')?.textContent).toContain(
      'Success!'
    );
    expect(compiled.querySelector('.bi-check-circle')).not.toBeNull();
  });

  it('should display the correct message and icon for error type', () => {
    component.message = 'An error occurred.';
    component.type = 'error';
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.modal-body p')?.textContent).toContain(
      'An error occurred.'
    );
    expect(compiled.querySelector('.icon-feedback')).toBeNull();
  });

  it('should display confirm buttons when confirmButtons is true', () => {
    component.confirmButtons = true;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.d-flex.justify-content-center')).not.toBeNull();
  });

  it('should call toastService.hideModal when close is called', () => {
    component.close();
    expect(toastService.hideModal).toHaveBeenCalled();
  });

  it('should call confirmCallback and close when confirm is called', () => {
    const callbackSpy = jasmine.createSpy('confirmCallback');
    component.confirmCallback = callbackSpy;

    component.confirm();

    expect(callbackSpy).toHaveBeenCalled();
    expect(toastService.hideModal).toHaveBeenCalled();
  });

  it('should not throw error if confirm is called without a callback', () => {
    component.confirmCallback = undefined;

    expect(() => component.confirm()).not.toThrow();
    expect(toastService.hideModal).toHaveBeenCalled();
  });
});
