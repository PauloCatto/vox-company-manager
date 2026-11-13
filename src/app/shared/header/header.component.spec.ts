import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Component } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';

import { HeaderComponent } from './header.component';
import { CompanyService } from '../../core/services/company.service';
import { Company } from '../../shared/interfaces/company.interfaces';

@Component({ template: '' })
class DummyComponent {}

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let router: Router;
  let companyService: jasmine.SpyObj<CompanyService>;
  let companiesSubject: BehaviorSubject<Company[]>;

  beforeEach(async () => {
    companiesSubject = new BehaviorSubject<Company[]>([]);
    const companyServiceSpy = jasmine.createSpyObj('CompanyService', ['fetchCompanies'], {
      companies$: companiesSubject.asObservable(),
    });

    await TestBed.configureTestingModule({
      imports: [
        HeaderComponent,
        RouterTestingModule.withRoutes([
          { path: '', component: DummyComponent },
          { path: 'company-registration', component: DummyComponent },
        ]),
      ],
      providers: [
        { provide: CompanyService, useValue: companyServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    companyService = TestBed.inject(CompanyService) as jasmine.SpyObj<CompanyService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call fetchCompanies on init', () => {
    expect(companyService.fetchCompanies).toHaveBeenCalled();
  });

  it('should show the "Abrir Solicitação" button on the root URL', fakeAsync(() => {
    router.navigate(['/']);
    tick();
    expect(component.showOpenButton).toBe(true);
  }));

  it('should hide the "Abrir Solicitação" button on the registration page', fakeAsync(() => {
    router.navigate(['/company-registration']);
    tick();
    expect(component.showOpenButton).toBe(false);
  }));

  it('should navigate to /company-registration when openForm is called', () => {
    const navigateSpy = spyOn(router, 'navigate');
    component.openForm();
    expect(navigateSpy).toHaveBeenCalledWith(['/company-registration']);
  });

  it('should disable the button when there are no companies', () => {
    companiesSubject.next([]);
    fixture.detectChanges();
    expect(component.disableButton).toBe(true);
  });

  it('should enable the button when there are companies', () => {
    companiesSubject.next([{ id: '1' } as Company]);
    fixture.detectChanges();
    expect(component.disableButton).toBe(false);
  });
});
