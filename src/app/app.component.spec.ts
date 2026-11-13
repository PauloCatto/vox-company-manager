import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { CompanyService } from './core/services/company.service';
import { of } from 'rxjs';

describe('AppComponent', () => {
  let companyServiceSpy: jasmine.SpyObj<CompanyService>;

  beforeEach(async () => {
    companyServiceSpy = jasmine.createSpyObj(
      'CompanyService',
      ['fetchCompanies'],
      {
        companies$: of([]),
      }
    );

    await TestBed.configureTestingModule({
      imports: [AppComponent, RouterTestingModule],
      providers: [{ provide: CompanyService, useValue: companyServiceSpy }],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'vox-tecnologia' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('vox-tecnologia');
  });

  it('should render the header', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-header')).not.toBeNull();
  });
});
