import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { finalize, Subject, takeUntil, catchError, of } from 'rxjs';
import { CompanyService } from '../../../core/services/company.service';
import {
  Company,
  EntityRegistry,
} from '../../../shared/interfaces/company.interfaces';
import { ToastService } from '../../../core/services/toast.service';
@Component({
  selector: 'app-company-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './company-list.component.html',
  styleUrl: './company-list.component.scss',
})
export class CompanyListComponent implements OnInit, OnDestroy {
  editing: boolean = false;
  loading: boolean = false;
  selectedOrder: Company | null = null;
  orders: Company[] = [];
  entidadeRegistro: EntityRegistry[] = [
    { key: 107305, value: 'Cartório' },
    { key: 107306, value: 'Junta Comercial' },
    { key: 107308, value: 'OAB' },
    { key: 107309, value: 'RFB' },
  ];

  public router = inject(Router);
  private toastService = inject(ToastService);
  private companyService = inject(CompanyService);
  public destroy$ = new Subject<void>();
  ngOnInit(): void {
    this.companyService.companies$
      .pipe(takeUntil(this.destroy$))
      .subscribe((companies) => {
        this.orders = companies;
        this.loading = false;
      });

    this.getCompanies();
  }

  getCompanies(): void {
    this.loading = true;
    this.companyService.fetchCompanies();
  }

  deleteOrder(order: Company): void {
    if (!order.id) return;

    const deleteCallback = () => {
      this.loading = true;
      this.companyService
        .deleteCompany(order.id!)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => (this.loading = false))
        )
        .subscribe({
          next: () => {
            this.toastService.success('Pedido excluído com sucesso.');
            if (this.selectedOrder?.id === order.id) {
              this.selectedOrder = null;
            }
          },
          error: (err) => {
            this.toastService.error('Erro ao excluir o pedido.');
          },
        });
    };

    this.toastService.info(
      'Tem certeza que deseja excluir este pedido?',
      deleteCallback
    );
  }

  viewOrder(order: Company): void {
    this.selectedOrder = order;
    this.editing = true;
  }

  editOrder(order: Company): void {
    if (order && order.id) {
      this.router.navigate(['/company-registration', order.id]);
    }
  }

  formatCpf(cpf?: string): string {
    return cpf?.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4') ?? '-';
  }

  formatCep(cep?: number | string): string {
    if (!cep) return '-';
    const s = cep.toString().padStart(8, '0');
    return s.replace(/^(\d{5})(\d{3})$/, '$1-$2');
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }
  getEntityName(value?: string | number): string {
    if (!value) return '';
    const entidade = this.entidadeRegistro.find((e) => e.value === value);
    return entidade ? entidade.value : '-';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
