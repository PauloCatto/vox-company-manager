import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CompanyService } from '../../core/services/company.service';
import {
  Company,
  EntityRegistry,
} from '../../shared/interfaces/company.interfaces';

export interface ChartMetric {
  label: string;
  count: number;
  percentage: number;
  color: string;
}

@Component({
  selector: 'app-bi-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bi-dashboard.component.html',
  styleUrl: './bi-dashboard.component.scss',
})
export class BiDashboardComponent implements OnInit, OnDestroy {
  companies: Company[] = [];
  filteredCompanies: Company[] = [];

  selectedUf: string = '';
  selectedEntity: string = '';
  selectedStatus: string = '';

  availableUfs: string[] = [];
  entityMetrics: ChartMetric[] = [];
  ufMetrics: ChartMetric[] = [];
  statusMetrics: ChartMetric[] = [];
  ageMetrics: ChartMetric[] = [];
  monthlyMetrics: { month: string; count: number; heightPct: number }[] = [];

  approvalRate: number = 0;
  averageAge: number = 0;
  topEntityName: string = '-';
  uniqueCitiesCount: number = 0;

  entidadeRegistro: EntityRegistry[] = [
    { key: 107305, value: 'Cartório' },
    { key: 107306, value: 'Junta Comercial' },
    { key: 107308, value: 'OAB' },
    { key: 107309, value: 'RFB' },
  ];

  public router = inject(Router);
  private companyService = inject(CompanyService);
  private destroy$ = new Subject<void>();

  private readonly palette = [
    '#2563eb',
    '#0ea5e9',
    '#6366f1',
    '#10b981',
    '#f59e0b',
    '#ec4899',
    '#8b5cf6',
  ];

  ngOnInit(): void {
    this.companyService.companies$
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.companies = data ?? [];
        this.extractAvailableUfs();
        this.applyFilters();
      });

    this.companyService.fetchCompanies();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  extractAvailableUfs(): void {
    const ufs = new Set<string>();
    this.companies.forEach((c) => {
      const uf = c.empresa?.endereco?.ds_uf;
      if (uf) ufs.add(uf);
    });
    this.availableUfs = Array.from(ufs).sort();
  }

  applyFilters(): void {
    this.filteredCompanies = this.companies.filter((c) => {
      const matchUf =
        !this.selectedUf || c.empresa?.endereco?.ds_uf === this.selectedUf;
      const entityName = this.getEntityName(c.empresa?.co_entidade_registro);
      const matchEntity =
        !this.selectedEntity || entityName === this.selectedEntity;
      const status = c.status || 'Aprovado';
      const matchStatus = !this.selectedStatus || status === this.selectedStatus;
      return matchUf && matchEntity && matchStatus;
    });

    this.computeAnalytics();
  }

  resetFilters(): void {
    this.selectedUf = '';
    this.selectedEntity = '';
    this.selectedStatus = '';
    this.applyFilters();
  }

  getEntityName(value?: string | number): string {
    if (!value) return 'Não informado';
    const entidade = this.entidadeRegistro.find(
      (e) => String(e.key) === String(value) || e.value === value
    );
    return entidade ? entidade.value : String(value);
  }

  private computeAnalytics(): void {
    const total = this.filteredCompanies.length;

    // Unique cities
    const cities = new Set(
      this.filteredCompanies
        .map((c) => c.empresa?.endereco?.ds_municipio)
        .filter(Boolean)
    );
    this.uniqueCitiesCount = cities.size;

    // Entity metrics
    const entityCounts = new Map<string, number>();
    this.entidadeRegistro.forEach((e) => entityCounts.set(e.value, 0));

    this.filteredCompanies.forEach((c) => {
      const name = this.getEntityName(c.empresa?.co_entidade_registro);
      entityCounts.set(name, (entityCounts.get(name) || 0) + 1);
    });

    this.entityMetrics = Array.from(entityCounts.entries())
      .map(([label, count], idx) => ({
        label,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        color: this.palette[idx % this.palette.length],
      }))
      .sort((a, b) => b.count - a.count);

    this.topEntityName =
      this.entityMetrics[0]?.count > 0 ? this.entityMetrics[0].label : '-';

    // UF metrics
    const ufCounts = new Map<string, number>();
    this.filteredCompanies.forEach((c) => {
      const uf = c.empresa?.endereco?.ds_uf || 'N/A';
      ufCounts.set(uf, (ufCounts.get(uf) || 0) + 1);
    });

    this.ufMetrics = Array.from(ufCounts.entries())
      .map(([label, count], idx) => ({
        label,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        color: this.palette[idx % this.palette.length],
      }))
      .sort((a, b) => b.count - a.count);

    // Status metrics
    const statusColors: Record<string, string> = {
      Aprovado: '#10b981',
      'Em Análise': '#f59e0b',
      Pendente: '#ef4444',
    };
    const statusCounts = new Map<string, number>([
      ['Aprovado', 0],
      ['Em Análise', 0],
      ['Pendente', 0],
    ]);

    this.filteredCompanies.forEach((c) => {
      const st = c.status || 'Aprovado';
      statusCounts.set(st, (statusCounts.get(st) || 0) + 1);
    });

    const approvedCount = statusCounts.get('Aprovado') || 0;
    this.approvalRate = total > 0 ? Math.round((approvedCount / total) * 100) : 0;

    this.statusMetrics = Array.from(statusCounts.entries()).map(
      ([label, count]) => ({
        label,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        color: statusColors[label] || '#64748b',
      })
    );

    // Age metrics
    const ageBrackets = new Map<string, number>([
      ['Até 30 anos', 0],
      ['31 a 40 anos', 0],
      ['41 anos ou mais', 0],
    ]);
    let ageSum = 0;
    let validAges = 0;

    this.filteredCompanies.forEach((c) => {
      const age = this.calculateAge(c.solicitante?.date_nascimento);
      if (age > 0) {
        ageSum += age;
        validAges++;
        if (age <= 30) {
          ageBrackets.set('Até 30 anos', (ageBrackets.get('Até 30 anos') || 0) + 1);
        } else if (age <= 40) {
          ageBrackets.set(
            '31 a 40 anos',
            (ageBrackets.get('31 a 40 anos') || 0) + 1
          );
        } else {
          ageBrackets.set(
            '41 anos ou mais',
            (ageBrackets.get('41 anos ou mais') || 0) + 1
          );
        }
      }
    });

    this.averageAge = validAges > 0 ? Math.round(ageSum / validAges) : 0;
    const ageColors = ['#0ea5e9', '#6366f1', '#8b5cf6'];
    this.ageMetrics = Array.from(ageBrackets.entries()).map(
      ([label, count], idx) => ({
        label,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        color: ageColors[idx % ageColors.length],
      })
    );

    // Monthly timeline metrics
    const monthLabels: Record<string, string> = {
      '06': 'Jun',
      '07': 'Jul',
      '08': 'Ago',
      '09': 'Set',
      '10': 'Out',
      '11': 'Nov',
    };
    const monthCounts = new Map<string, number>([
      ['Jun', 0],
      ['Jul', 0],
      ['Ago', 0],
      ['Set', 0],
      ['Out', 0],
      ['Nov', 0],
    ]);

    this.filteredCompanies.forEach((c, idx) => {
      const created = c.created_at;
      if (created && created.length >= 7) {
        const m = created.substring(5, 7);
        const label = monthLabels[m] || 'Nov';
        monthCounts.set(label, (monthCounts.get(label) || 0) + 1);
      } else {
        const fallbackMonths = ['Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov'];
        const mLabel = fallbackMonths[idx % fallbackMonths.length];
        monthCounts.set(mLabel, (monthCounts.get(mLabel) || 0) + 1);
      }
    });

    const maxMonth = Math.max(...Array.from(monthCounts.values()), 1);
    this.monthlyMetrics = Array.from(monthCounts.entries()).map(
      ([month, count]) => ({
        month,
        count,
        heightPct: Math.max(Math.round((count / maxMonth) * 100), 12),
      })
    );
  }

  calculateAge(birthDate?: string): number {
    if (!birthDate) return 0;
    const parts = birthDate.split('-');
    if (parts.length < 3) return 0;
    const birthYear = parseInt(parts[0], 10);
    const currentYear = new Date().getFullYear();
    return Math.max(currentYear - birthYear, 0);
  }

  exportBiCsv(): void {
    const headers = [
      'ID',
      'Nome Fantasia',
      'Responsavel',
      'CPF',
      'Entidade Registro',
      'Municipio',
      'UF',
      'Status',
      'Data Criacao',
    ];
    const rows = this.filteredCompanies.map((c) => [
      c.id || '',
      `"${(c.empresa?.ds_nome_fantasia || '').replace(/"/g, '""')}"`,
      `"${(c.solicitante?.ds_responsavel || '').replace(/"/g, '""')}"`,
      c.solicitante?.nu_cpf || '',
      `"${this.getEntityName(c.empresa?.co_entidade_registro)}"`,
      `"${c.empresa?.endereco?.ds_municipio || ''}"`,
      c.empresa?.endereco?.ds_uf || '',
      c.status || 'Aprovado',
      c.created_at || '2026-11-01',
    ]);

    const csvContent =
      '\uFEFF' +
      [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vox-bi-relatorio-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

