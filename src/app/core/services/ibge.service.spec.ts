import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { IbgeService } from './ibge.service';
import { environment } from '../../../environments/environment';
import { State, City } from '../../shared/interfaces/ibge.interfaces';

describe('IbgeService', () => {
  let service: IbgeService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [IbgeService],
    });

    service = TestBed.inject(IbgeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch states', () => {
    const mockStates: State[] = [
      { id: 1, sigla: 'SP', nome: 'São Paulo' },
      { id: 2, sigla: 'RJ', nome: 'Rio de Janeiro' },
    ];

    service.getStates().subscribe((states) => {
      expect(states).toEqual(mockStates);
    });

    const req = httpMock.expectOne(environment.states);
    expect(req.request.method).toBe('GET');
    req.flush(mockStates);
  });

  it('should fetch cities by state', () => {
    const uf = 'SP';
    const mockCities: City[] = [
      { id: 101, nome: 'São Paulo' },
      { id: 102, nome: 'Campinas' },
    ];

    service.getCitiesByState(uf).subscribe((cities) => {
      expect(cities).toEqual(mockCities);
    });

    const req = httpMock.expectOne(`${environment.states}${uf}/municipios`);
    expect(req.request.method).toBe('GET');
    req.flush(mockCities);
  });
});
