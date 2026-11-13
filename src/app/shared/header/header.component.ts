import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter, Subject, takeUntil } from 'rxjs';
import { CompanyService } from '../../core/services/company.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  showOpenButton: boolean = true;
  disableButton: boolean = true;

  private router = inject(Router);
  private companyService = inject(CompanyService);
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => this.updateOpenButtonVisibility());

    this.companyService.companies$
      .pipe(takeUntil(this.destroy$))
      .subscribe(companies => {
        this.disableButton = companies.length === 0;
      });

    this.companyService.fetchCompanies();
  }

  updateOpenButtonVisibility(): void {
    const url = this.router.url;
    this.showOpenButton = !url.includes('company-registration');
  }

  openForm(): void {
    this.router.navigate(['/company-registration']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
