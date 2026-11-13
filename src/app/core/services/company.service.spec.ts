import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { CompanyService } from './company.service';
import { environment } from '../../../environments/environment';
import { Company } from '../../shared/interfaces/company.interfaces';

describe('CompanyService', () => {
  let service: CompanyService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CompanyService],
    });

    service = TestBed.inject(CompanyService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch all companies', () => {
    const mockCompanies: Company[] = [
      {
        id: '1',
        solicitante: {
          ds_responsavel: 'Alice',
          nu_cpf: '12345678901',
          date_nascimento: '1990-01-01',
        },
        empresa: {
          ds_nome_fantasia: 'Empresa A',
          co_entidade_registro: 'OAB',
          endereco: {
            ds_logradouro: 'Rua A',
            co_numero: '10',
            ds_complemento: '',
            ds_bairro: 'Bairro A',
            ds_municipio: 'Cidade A',
            ds_uf: 'SP',
            co_cep: '12345678',
          },
        },
        companyName: '',
      },
    ];

    service.getCompanies().subscribe((companies) => {
      expect(companies.length).toBe(1);
      expect(companies).toEqual(mockCompanies);
    });

    const req = httpMock.expectOne(environment.companies);
    expect(req.request.method).toBe('GET');
    req.flush(mockCompanies);
  });

  it('should fetch company by id', () => {
    const mockCompany: Company = {
      id: '1',
      solicitante: {
        ds_responsavel: 'Alice',
        nu_cpf: '12345678901',
        date_nascimento: '1990-01-01',
      },
      empresa: {
        ds_nome_fantasia: 'Empresa A',
        co_entidade_registro: 'OAB',
        endereco: {
          ds_logradouro: 'Rua A',
          co_numero: '10',
          ds_complemento: '',
          ds_bairro: 'Bairro A',
          ds_municipio: 'Cidade A',
          ds_uf: 'SP',
          co_cep: '12345678',
        },
      },
      companyName: '',
    };

    service.getCompanyById('1').subscribe((company) => {
      expect(company).toEqual(mockCompany);
    });

    const req = httpMock.expectOne(`${environment.companies}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockCompany);
  });

  it('should create a company', () => {
    const newCompanyPayload = {
      solicitante: {
        ds_responsavel: 'Bob',
        nu_cpf: '98765432100',
        date_nascimento: '1995-05-05',
      },
      empresa: {
        ds_nome_fantasia: 'Empresa B',
        co_entidade_registro: 'RFB',
        endereco: {
          ds_logradouro: 'Rua B',
          co_numero: '20',
          ds_complemento: '',
          ds_bairro: 'Bairro B',
          ds_municipio: 'Cidade B',
          ds_uf: 'RJ',
          co_cep: '87654321',
        },
      },
    };

    const createdCompany: Company = {
      ...newCompanyPayload,
      id: '2',
      companyName: '',
    };

    service.createCompany(newCompanyPayload).subscribe((company) => {
      expect(company).toEqual(createdCompany);
    });

    const req = httpMock.expectOne(environment.companies);
    expect(req.request.method).toBe('POST');
    req.flush(createdCompany);
  });

  it('should update a company', () => {
    const updatedCompanyPayload = {
      solicitante: {
        ds_responsavel: 'Alice Updated',
        nu_cpf: '12345678901',
        date_nascimento: '1990-01-01',
      },
      empresa: {
        ds_nome_fantasia: 'Empresa A Updated',
        co_entidade_registro: 'OAB',
        endereco: {
          ds_logradouro: 'Rua A',
          co_numero: '10',
          ds_complemento: '',
          ds_bairro: 'Bairro A',
          ds_municipio: 'Cidade A',
          ds_uf: 'SP',
          co_cep: '12345678',
        },
      },
    };

    const updatedCompany: Company = {
      ...updatedCompanyPayload,
      id: '1',
      companyName: '',
    };

    service.updateCompany('1', updatedCompanyPayload).subscribe((company) => {
      expect(company).toEqual(updatedCompany);
    });

    const req = httpMock.expectOne(`${environment.companies}/1`);
    expect(req.request.method).toBe('PUT');
    req.flush(updatedCompany);
  });

  it('should fetch entities registry', () => {
    const mockEntities = [
      { key: 107305, value: 'Cartório' },
      { key: 107308, value: 'OAB' },
    ];

    service.getEntitiesRegistry().subscribe((entities) => {
      expect(entities.length).toBe(2);
      expect(entities).toEqual(mockEntities);
    });

    const req = httpMock.expectOne(environment.entitiesRegistry);
    expect(req.request.method).toBe('GET');
    req.flush(mockEntities);
  });
});
