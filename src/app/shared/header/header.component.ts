import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter, Subject, takeUntil } from 'rxjs';
import { CompanyService } from '../../core/services/company.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  showOpenButton: boolean = true;
  disableButton: boolean = true;
  currentUrl: string = '/home';

  public router = inject(Router);
  private companyService = inject(CompanyService);
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.updateOpenButtonVisibility();

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.updateOpenButtonVisibility());

    this.companyService.companies$
      .pipe(takeUntil(this.destroy$))
      .subscribe((companies) => {
        this.disableButton = companies.length === 0;
      });

    this.companyService.fetchCompanies();
  }

  updateOpenButtonVisibility(): void {
    const url = this.router.url;
    this.currentUrl = url;
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
