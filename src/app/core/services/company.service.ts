import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, take, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Company } from '../../shared/interfaces/company.interfaces';

@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  private http = inject(HttpClient);
  private env = environment;

  private companiesSubject = new BehaviorSubject<Company[]>([]);
  companies$ = this.companiesSubject.asObservable();

  getCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>(this.env.companies);
  }

  getCompanyById(id: number | string): Observable<Company> {
    return this.http.get<Company>(`${this.env.companies}/${id}`);
  }

createCompany(company: any): Observable<Company> {
  return this.http.post<Company>(this.env.companies, company).pipe(
    tap(newCompany => {
      const current = this.companiesSubject.value;
      this.companiesSubject.next([...current, newCompany]);
    })
  );
}

updateCompany(id: number | string, company: any): Observable<Company> {
  return this.http.put<Company>(`${this.env.companies}/${id}`, company).pipe(
    tap(updatedCompany => {
      const current = this.companiesSubject.value;
      const index = current.findIndex(c => c.id === id);
      if (index !== -1) current[index] = updatedCompany;
      this.companiesSubject.next([...current]);
    })
  );
}
  getEntitiesRegistry(): Observable<{ key: string | number; value: string }[]> {
    return this.http.get<{ key: string | number; value: string }[]>(
      this.env.entitiesRegistry
    );
  }

   fetchCompanies(): void {
    this.getCompanies()
      .pipe(take(1))
      .subscribe({
        next: data => this.companiesSubject.next(data ?? []),
        error: () => this.companiesSubject.next([]),
      });
  }

  deleteCompany(id: string): Observable<void> {
    return this.http.delete<void>(`${this.env.companies}/${id}`).pipe(
      tap(() => {
        const currentCompanies = this.companiesSubject.getValue();
        const updatedCompanies = currentCompanies.filter(
          (company) => company.id !== id
        );
        this.companiesSubject.next(updatedCompanies);
      })
    );
  }

}
