import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CompanyListComponent } from './company-list.component';
import { RouterTestingModule } from '@angular/router/testing';
import { of, BehaviorSubject } from 'rxjs';
import { CompanyService } from '../../../core/services/company.service';
import { ToastService } from '../../../core/services/toast.service';
import { Company } from '../../../shared/interfaces/company.interfaces';
import { Router } from '@angular/router';

const toastServiceMock = {
  success: jasmine.createSpy('success'),
  error: jasmine.createSpy('error'),
  info: jasmine.createSpy('info'),
};

describe('CompanyListComponent', () => {
  let component: CompanyListComponent;
  let fixture: ComponentFixture<CompanyListComponent>;
  let companyService: jasmine.SpyObj<CompanyService>;
  let toastService: jasmine.SpyObj<ToastService>;
  let router: Router;
  let companiesSubject: BehaviorSubject<Company[]>;

  beforeEach(async () => {
    companiesSubject = new BehaviorSubject<Company[]>([]);
    const companyServiceSpy = jasmine.createSpyObj('CompanyService', [
      'fetchCompanies',
      'deleteCompany',
    ], {
      companies$: companiesSubject.asObservable()
    });

    await TestBed.configureTestingModule({
      imports: [CompanyListComponent, RouterTestingModule],
      providers: [
        { provide: CompanyService, useValue: companyServiceSpy },
        { provide: ToastService, useValue: toastServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CompanyListComponent);
    component = fixture.componentInstance;
    companyService = TestBed.inject(
      CompanyService
    ) as jasmine.SpyObj<CompanyService>;
    toastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
    router = TestBed.inject(Router);

  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should call fetchCompanies on init', () => {
    fixture.detectChanges();
    expect(companyService.fetchCompanies).toHaveBeenCalled();
  });

  describe('getCompanies', () => {
    it('should load companies successfully', () => {
      const mockCompanies: Company[] = [
        { id: '1', empresa: { ds_nome_fantasia: 'Test Co' } } as Company,
      ];
      companiesSubject.next(mockCompanies);

      component.getCompanies();
      fixture.detectChanges();

      expect(companyService.fetchCompanies).toHaveBeenCalled();
      expect(component.orders).toEqual(mockCompanies);
    });

    it('should handle empty company list', () => {
      companiesSubject.next([]);
      component.getCompanies();
      fixture.detectChanges();
      expect(component.orders).toEqual([]);
    });
  });

  it('should set selectedOrder and editing flag on viewOrder', () => {
    const mockOrder: Company = {
      id: '1',
      empresa: { ds_nome_fantasia: 'View Co' },
    } as Company;
    component.viewOrder(mockOrder);
    expect(component.selectedOrder).toBe(mockOrder);
    expect(component.editing).toBeTrue();
  });

  describe('deleteOrder', () => {
    it('should call deleteCompany and show success toast on confirmation', () => {
      const mockOrder: Company = { id: '1' } as Company;
      companyService.deleteCompany.and.returnValue(of(void 0));
      toastService.info.and.callFake((message, callback) => {
        if (callback) {
          callback();
        }
      });

      component.deleteOrder(mockOrder);

      expect(toastService.info).toHaveBeenCalledWith(
        'Tem certeza que deseja excluir este pedido?',
        jasmine.any(Function)
      );
      expect(companyService.deleteCompany).toHaveBeenCalledWith('1');
      expect(toastService.success).toHaveBeenCalledWith(
        'Pedido excluído com sucesso.'
      );
      expect(component.loading).toBeFalse();
    });
  });

  describe('editOrder', () => {
    it('should navigate to edit page with order id', () => {
      const mockOrder: Company = {
        id: '2',
        empresa: { ds_nome_fantasia: 'Edit Co' },
      } as Company;
      const navigateSpy = spyOn(router, 'navigate');

      component.editOrder(mockOrder);

      expect(navigateSpy).toHaveBeenCalledWith(['/company-registration', '2']);
    });

    it('should not navigate if order or order.id is missing', () => {
      const navigateSpy = spyOn(router, 'navigate');

      component.editOrder({} as Company);
      expect(navigateSpy).not.toHaveBeenCalled();

      component.editOrder({ id: null } as unknown as Company);
      expect(navigateSpy).not.toHaveBeenCalled();
    });
  });

  describe('Formatters', () => {
    it('should format CPF correctly', () => {
      expect(component.formatCpf('12345678901')).toBe('123.456.789-01');
      expect(component.formatCpf('123')).toBe('123');
      expect(component.formatCpf(undefined)).toBe('-');
    });

    it('should format CEP correctly', () => {
      expect(component.formatCep('12345678')).toBe('12345-678');
      expect(component.formatCep(12345678)).toBe('12345-678');
      expect(component.formatCep('12345')).toBe('00012-345');
      expect(component.formatCep(undefined)).toBe('-');
    });

    it('should format date correctly', () => {
      const date = new Date('2023-10-27T12:00:00Z');
      const dateStr = date.toISOString();
      expect(component.formatDate(dateStr)).toBe('27/10/2023');
      expect(component.formatDate(undefined)).toBe('-');
    });

    it('should get entity name correctly', () => {
      expect(component.getEntityName('OAB')).toBe('OAB');
      expect(component.getEntityName('RFB')).toBe('RFB');
      expect(component.getEntityName('Inexistente')).toBe('-');
      expect(component.getEntityName(undefined)).toBe('');
      expect(component.getEntityName()).toBe('');
    });
  });

  it('should complete destroy$ subject on ngOnDestroy', () => {
    spyOn(component['destroy$'], 'next');
    spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(component.destroy$.next).toHaveBeenCalled();
    expect(component.destroy$.complete).toHaveBeenCalled();
  });
});
