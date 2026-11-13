import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import { CompanyRegistrationComponent } from './company-registration.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { ToastService } from '../../../core/services/toast.service';
import { CompanyService } from '../../../core/services/company.service';
import { IbgeService } from '../../../core/services/ibge.service';
import { of, throwError } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Company } from '../../../shared/interfaces/company.interfaces';

describe('CompanyRegistrationComponent', () => {
  let component: CompanyRegistrationComponent;
  let fixture: ComponentFixture<CompanyRegistrationComponent>;
  let companyService: jasmine.SpyObj<CompanyService>;
  let ibgeService: jasmine.SpyObj<IbgeService>;
  let toastService: jasmine.SpyObj<ToastService>;
  let router: Router;
  let route: ActivatedRoute;

  beforeEach(async () => {
    const companyServiceSpy = jasmine.createSpyObj('CompanyService', [
      'getEntitiesRegistry',
      'createCompany',
      'updateCompany',
      'getCompanyById',
    ]);
    const ibgeServiceSpy = jasmine.createSpyObj('IbgeService', [
      'getStates',
      'getCitiesByState',
    ]);
    const toastServiceSpy = jasmine.createSpyObj('ToastService', [
      'success',
      'error',
      'info',
    ]);

    await TestBed.configureTestingModule({
      imports: [
        CompanyRegistrationComponent,
        ReactiveFormsModule,
        RouterTestingModule.withRoutes([]),
      ],
      providers: [
        { provide: CompanyService, useValue: companyServiceSpy },
        { provide: IbgeService, useValue: ibgeServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => null,
              },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CompanyRegistrationComponent);
    component = fixture.componentInstance;
    companyService = TestBed.inject(
      CompanyService
    ) as jasmine.SpyObj<CompanyService>;
    ibgeService = TestBed.inject(IbgeService) as jasmine.SpyObj<IbgeService>;
    toastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
    router = TestBed.inject(Router);
    route = TestBed.inject(ActivatedRoute);

    companyService.getEntitiesRegistry.and.returnValue(
      of([{ key: 1, value: 'OAB' }])
    );
    ibgeService.getStates.and.returnValue(
      of([{ id: 1, sigla: 'SP', nome: 'São Paulo' }])
    );
    ibgeService.getCitiesByState.and.returnValue(
      of([{ id: 1, nome: 'São Paulo' }])
    );

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form on ngOnInit', () => {
    expect(component.cadastroForm).toBeDefined();
    expect(component.controls['responsavel']).toBeDefined();
    expect(component.controls['cpf']).toBeDefined();
  });

  it('should call initial data loading methods on ngOnInit', () => {
    spyOn(component, 'initializeForm').and.callThrough();
    spyOn(component, 'getEntitiesRegistry').and.callThrough();
    spyOn(component, 'getStates').and.callThrough();
    spyOn(component, 'checkEditMode');
    spyOn<any>(component, 'setupCityControl');

    component.ngOnInit();

    expect(component.initializeForm).toHaveBeenCalled();
    expect(component.getEntitiesRegistry).toHaveBeenCalled();
    expect(component.getStates).toHaveBeenCalled();
    expect(component.checkEditMode).toHaveBeenCalled();
    expect(component.setupCityControl).toHaveBeenCalled();
  });

  describe('Data Loading Error Handling', () => {
    it('should handle error on getEntitiesRegistry', () => {
      const error = new Error('Failed to load entities');
      companyService.getEntitiesRegistry.and.returnValue(throwError(() => error));
      spyOn(console, 'error');

      component.getEntitiesRegistry();

      expect(component.entitiesRegistry).toEqual([]);
      expect(toastService.error).toHaveBeenCalledWith('Erro ao carregar entidades de registro. Por favor, tente novamente.');
    });

    it('should handle error on getStates', () => {
      const error = new Error('Failed to load states');
      ibgeService.getStates.and.returnValue(throwError(() => error));
      spyOn(console, 'error');

      component.getStates();

      expect(component.states).toEqual([]);
      expect(toastService.error).toHaveBeenCalledWith('Erro ao carregar estados. Por favor, tente novamente.');
    });

    it('should handle error on loadCities', () => {
      const error = new Error('Failed to load cities');
      ibgeService.getCitiesByState.and.returnValue(throwError(() => error));
      spyOn(console, 'error');

      component.loadCities('SP');

      expect(component.cities).toEqual([]);
      expect(toastService.error).toHaveBeenCalledWith('Erro ao carregar cidades. Por favor, tente novamente.');
    });
  });

  describe('Form Validation', () => {
    it('should make form invalid if required fields are empty', () => {
      component.cadastroForm.setValue({
        responsavel: '',
        cpf: '',
        dataNascimento: '',
        nomeFantasia: '',
        entidadeRegistro: '',
        cep: '',
        endereco: '',
        numero: '',
        bairro: '',
        complemento: '',
        cidade: '',
        estado: '',
      });
      expect(component.cadastroForm.valid).toBeFalsy();
    });

    it('should make form valid with correct data', () => {
      component.cadastroForm.setValue({
        responsavel: 'John Doe',
        cpf: '12345678901',
        dataNascimento: '1990-01-01',
        nomeFantasia: 'Test Corp',
        entidadeRegistro: 'OAB',
        cep: '12345678',
        endereco: 'Main St',
        numero: '123',
        bairro: 'Downtown',
        complemento: '',
        cidade: 'São Paulo',
        estado: 'SP',
      });
      expect(component.cadastroForm.valid).toBeTruthy();
    });

    it('should have an invalid cpf if pattern is wrong', () => {
      const cpfControl = component.controls['cpf'];
      cpfControl.setValue('123');
      expect(cpfControl.valid).toBeFalsy();
    });
  });

  describe('Edit Mode', () => {
    it('should enter edit mode and fetch data if id is in route', () => {
      const mockCompany: Company = {
        id: '123',
        solicitante: { ds_responsavel: 'Test' },
        empresa: { endereco: { ds_uf: 'SP', ds_municipio: 'São Paulo' } },
      } as Company;
      spyOn(route.snapshot.paramMap, 'get').and.returnValue('123');
      companyService.getCompanyById.and.returnValue(of(mockCompany));
      spyOn(component, 'getData').and.callThrough();
      spyOn(component, 'loadCities').and.callThrough();

      component.checkEditMode();

      expect(component.isEditMode).toBeTrue();
      expect(component.currentId).toBe('123');
      expect(component.getData).toHaveBeenCalledWith('123');
      expect(companyService.getCompanyById).toHaveBeenCalledWith('123');
      expect(component.cadastroForm.value.responsavel).toBe('Test');
      expect(component.loadCities).toHaveBeenCalledWith('SP', 'São Paulo');
    });
  });

  describe('onSubmit', () => {
    it('should call createCompany when form is valid and not in edit mode', () => {
      component.isEditMode = false;
      spyOnProperty(component.cadastroForm, 'valid', 'get').and.returnValue(
        true
      );
      companyService.createCompany.and.returnValue(of({} as Company));

      component.onSubmit();

      expect(companyService.createCompany).toHaveBeenCalled();
      expect(toastService.success).toHaveBeenCalledWith(
        'Solicitação criada com sucesso',
        '/'
      );
    });

    it('should call updateCompany when form is valid and in edit mode', () => {
      component.isEditMode = true;
      component.currentId = '123';
      spyOnProperty(component.cadastroForm, 'valid', 'get').and.returnValue(
        true
      );
      companyService.updateCompany.and.returnValue(of({} as Company));

      component.onSubmit();

      expect(companyService.updateCompany).toHaveBeenCalled();
      expect(toastService.success).toHaveBeenCalledWith(
        'Solicitação atualizada com sucesso',
        '/'
      );
    });

    it('should handle error on createCompany', () => {
      component.isEditMode = false;
      spyOnProperty(component.cadastroForm, 'valid', 'get').and.returnValue(true);
      companyService.createCompany.and.returnValue(throwError(() => new Error('Create failed')));
      spyOn(console, 'error');
      component.onSubmit();
      expect(toastService.error).toHaveBeenCalledWith('Erro ao criar a solicitação. Por favor, tente novamente.');
    });

    it('should handle error on updateCompany', () => {
      component.isEditMode = true;
      component.currentId = '123';
      spyOnProperty(component.cadastroForm, 'valid', 'get').and.returnValue(true);
      companyService.updateCompany.and.returnValue(throwError(() => new Error('Update failed')));
      spyOn(console, 'error');
      component.onSubmit();
      expect(toastService.error).toHaveBeenCalledWith('Erro ao atualizar a solicitação. Por favor, tente novamente.');
    });

    it('should mark all as touched and not submit if form is invalid', () => {
      spyOnProperty(component.cadastroForm, 'valid', 'get').and.returnValue(
        false
      );
      spyOn(component.cadastroForm, 'markAllAsTouched');
      spyOn(console, 'error');

      component.onSubmit();

      expect(component.cadastroForm.markAllAsTouched).toHaveBeenCalled();
      expect(companyService.createCompany).not.toHaveBeenCalled();
      expect(companyService.updateCompany).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(
        'Please fill in all required fields correctly!'
      );
    });
  });

  describe('UI Helpers', () => {
    it('should filter non-numeric characters on onlyNumbers', () => {
      const mockEvent = {
        target: { value: '123a45' } as HTMLInputElement,
      } as unknown as Event;
      const control = component.controls['cpf'];
      component.onlyNumbers(mockEvent, 'cpf', 11);
      expect(control.value).toBe('12345');
    });
  });

  it('should call toast.info on goBack', () => {
    const navigateSpy = spyOn(router, 'navigate');
    // Espiona o método info e captura o callback
    toastService.info.and.callFake((message, callback) => {
      if (callback) {
        callback(); // Executa o callback
      }
    });

    component.goBack();
    expect(toastService.info).toHaveBeenCalledWith(
      'Deseja realmente sair sem terminar as alterações?',
      jasmine.any(Function)
    );
    expect(navigateSpy).toHaveBeenCalledWith(['/']);
  });

  it('should complete destroy$ on ngOnDestroy', () => {
    spyOn(component['destroy$'], 'next');
    spyOn(component['destroy$'], 'complete');
    component.ngOnDestroy();
    expect(component['destroy$'].next).toHaveBeenCalled();
    expect(component['destroy$'].complete).toHaveBeenCalled();
  });
});
