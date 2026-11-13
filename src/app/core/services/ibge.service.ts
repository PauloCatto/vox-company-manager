import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { State, City } from '../../shared/interfaces/ibge.interfaces';

@Injectable({
  providedIn: 'root',
})
export class IbgeService {
  private http = inject(HttpClient);
  private url = environment.states;

  constructor() {}

  getStates(): Observable<State[]> {
    return this.http.get<State[]>(this.url);
  }

  getCitiesByState(uf: string): Observable<City[]> {
    return this.http.get<City[]>(`${environment.states}${uf}/municipios`);
  }
}
