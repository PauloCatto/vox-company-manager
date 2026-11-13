import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize, Subject, takeUntil } from 'rxjs';
import { CompanyService } from '../../../core/services/company.service';
import {
  Company,
  EntityRegistry,
} from '../../../shared/interfaces/company.interfaces';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-company-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './company-list.component.html',
  styleUrl: './company-list.component.scss',
})
export class CompanyListComponent implements OnInit, OnDestroy {
  editing: boolean = false;
  loading: boolean = false;
  selectedOrder: Company | null = null;
  orders: Company[] = [];
  searchTerm: string = '';
  filterEntity: string = '';
  filterUf: string = '';

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
        if (this.orders.length > 0 && !this.selectedOrder) {
          this.selectedOrder = this.orders[0];
        }
      });

    this.getCompanies();
  }

  get filteredOrders(): Company[] {
    return this.orders.filter((order) => {
      const term = this.searchTerm.trim().toLowerCase();
      const matchesSearch =
        !term ||
        order.empresa?.ds_nome_fantasia?.toLowerCase().includes(term) ||
        order.solicitante?.ds_responsavel?.toLowerCase().includes(term) ||
        order.solicitante?.nu_cpf?.includes(term) ||
        order.empresa?.endereco?.ds_municipio?.toLowerCase().includes(term);

      const entityName = this.getEntityName(
        order.empresa?.co_entidade_registro
      );
      const matchesEntity =
        !this.filterEntity || entityName === this.filterEntity;

      const matchesUf =
        !this.filterUf || order.empresa?.endereco?.ds_uf === this.filterUf;

      return matchesSearch && matchesEntity && matchesUf;
    });
  }

  get availableUfs(): string[] {
    const ufs = new Set<string>();
    this.orders.forEach((o) => {
      const uf = o.empresa?.endereco?.ds_uf;
      if (uf) ufs.add(uf);
    });
    return Array.from(ufs).sort();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.filterEntity = '';
    this.filterUf = '';
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
          error: () => {
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
    const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoMatch) {
      return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;
    }
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  getEntityName(value?: string | number): string {
    if (!value) return '';
    const entidade = this.entidadeRegistro.find(
      (e) => String(e.key) === String(value) || e.value === value
    );
    return entidade ? entidade.value : '-';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
