import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, Subject, takeUntil } from 'rxjs';
import { CompanyService } from '../../../core/services/company.service';
import { IbgeService } from '../../../core/services/ibge.service';
import { ToastService } from '../../../core/services/toast.service';
import { State, City } from '../../../shared/interfaces/ibge.interfaces';
import {
  Company,
  EntityRegistry,
} from '../../../shared/interfaces/company.interfaces';

@Component({
  selector: 'app-company-registration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './company-registration.component.html',
  styleUrl: './company-registration.component.scss',
})
export class CompanyRegistrationComponent implements OnInit, OnDestroy {
  cadastroForm!: FormGroup;
  isEditMode: boolean = false;
  loadingCities: boolean = false;
  loadingCep: boolean = false;
  loadingForm: boolean = false;
  currentId: string | null = null;
  entitiesRegistry: string[] = [];
  entitiesRegistryItems: EntityRegistry[] = [];
  today: string = this.getToday();
  states: State[] = [];
  cities: City[] = [];

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroy$ = new Subject<void>();
  private companyService = inject(CompanyService);
  private ibgeService = inject(IbgeService);
  private toastService = inject(ToastService);

  ngOnInit(): void {
    this.initializeForm();
    this.getEntitiesRegistry();
    this.getStates();
    this.checkEditMode();
    this.setupCityControl();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initializeForm(): void {
    this.cadastroForm = this.fb.group({
      responsavel: ['', Validators.required],
      cpf: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d{11}$/),
          Validators.minLength(11),
          Validators.maxLength(11),
        ],
      ],
      dataNascimento: ['', Validators.required],
      nomeFantasia: ['', Validators.required],
      entidadeRegistro: ['', Validators.required],
      cep: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      endereco: ['', Validators.required],
      numero: ['', Validators.required],
      bairro: ['', Validators.required],
      complemento: [''],
      cidade: ['', Validators.required],
      estado: ['', Validators.required],
    });
  }

  get controls(): { [key: string]: AbstractControl } {
    return this.cadastroForm.controls;
  }

  getToday(): string {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();

    return `${year}-${month}-${day}`;
  }

  getEntitiesRegistry(): void {
    this.companyService
      .getEntitiesRegistry()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.entitiesRegistryItems = data ?? [];
          this.entitiesRegistry = data?.map((e: any) => e.value) ?? [];
        },
        error: (err) => {
          this.entitiesRegistry = [];
          this.entitiesRegistryItems = [];
          console.error('Erro ao carregar entidades de registro:', err);
          this.toastService.error(
            'Erro ao carregar entidades de registro. Por favor, tente novamente.'
          );
        },
      });
  }

  getStates(): void {
    this.ibgeService
      .getStates()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: State[]) => (this.states = data ?? []),
        error: (err) => {
          this.states = [];
          console.error('Erro ao carregar estados IBGE:', err);
          this.toastService.error(
            'Erro ao carregar estados. Por favor, tente novamente.'
          );
        },
      });
  }

  public setupCityControl(): void {
    const cityControl = this.cadastroForm.get('cidade');
    const stateControl = this.cadastroForm.get('estado');

    if (!this.isEditMode) cityControl?.disable();

    stateControl?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((uf) => {
        if (uf) {
          cityControl?.enable();
          this.cities = [];
          this.loadCities(uf);

          if (this.isEditMode) {
            cityControl?.setValue('');
            cityControl?.setErrors({ cidadeObrigatoria: true });
            cityControl?.markAsTouched();
          }
        } else {
          cityControl?.disable();
          cityControl?.setValue('');
          this.cities = [];
        }
      });
  }

  public loadCities(uf: string, selectedCity?: string) {
    this.loadingCities = true;
    const cityControl = this.cadastroForm.get('cidade');
    cityControl?.enable({ emitEvent: false });

    this.ibgeService
      .getCitiesByState(uf)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loadingCities = false;
        })
      )
      .subscribe({
        next: (data: City[]) => {
          this.cities = data ?? [];

          if (selectedCity) {
            const match = this.cities.find(
              (c) => c.nome.toLowerCase() === selectedCity.toLowerCase()
            );
            cityControl?.setValue(match?.nome ?? selectedCity, {
              emitEvent: false,
            });
            cityControl?.setErrors(null);
          }
        },
        error: (err) => {
          this.cities = [];
          console.error(err);
          this.toastService.error(
            'Erro ao carregar cidades. Por favor, tente novamente.'
          );
        },
      });
  }

  public onCepInput(event: Event): void {
    this.onlyNumbers(event, 'cep', 8);
    const cepVal = this.cadastroForm.get('cep')?.value;
    if (cepVal && cepVal.length === 8) {
      this.lookupCep(cepVal);
    }
  }

  public lookupCep(cep: string): void {
    this.loadingCep = true;
    this.ibgeService
      .getAddressByCep(cep)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.loadingCep = false))
      )
      .subscribe({
        next: (res) => {
          if (res && !res.erro) {
            this.cadastroForm.patchValue(
              {
                endereco: res.logradouro || this.cadastroForm.value.endereco,
                bairro: res.bairro || this.cadastroForm.value.bairro,
                estado: res.uf || this.cadastroForm.value.estado,
              },
              { emitEvent: false }
            );
            this.cadastroForm.markAsDirty();
            if (res.uf) {
              this.loadCities(res.uf, res.localidade);
            }
          }
        },
        error: () => {
          // Silent fallback if ViaCEP is unreachable
        },
      });
  }

  public onlyNumbers(
    event: Event,
    controlName: string,
    maxLength: number
  ): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;
    const originalValue = value.replace(/\D/g, '');
    const limitedValue = originalValue.substring(0, maxLength);

    this.cadastroForm
      .get(controlName)
      ?.setValue(limitedValue, { emitEvent: false });
    input.value = limitedValue;
  }

  checkEditMode(): void {
    this.currentId = this.route.snapshot.paramMap.get('id');
    if (this.currentId) {
      this.isEditMode = true;
      this.getData(this.currentId);
    }
  }

  private resolveEntityValue(rawVal?: string | number): string | number {
    if (!rawVal) return '';
    const match = this.entitiesRegistryItems.find(
      (e) => String(e.key) === String(rawVal) || e.value === rawVal
    );
    return match ? match.key : rawVal;
  }

  getData(id: string): void {
    this.companyService
      .getCompanyById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: Company) => {
          if (!data) return;

          const cepStr = data.empresa?.endereco?.co_cep
            ? String(data.empresa.endereco.co_cep).padStart(8, '0')
            : '';

          this.cadastroForm.patchValue(
            {
              responsavel: data.solicitante?.ds_responsavel || '',
              cpf: data.solicitante?.nu_cpf || '',
              dataNascimento: data.solicitante?.date_nascimento || '',
              nomeFantasia: data.empresa?.ds_nome_fantasia || '',
              entidadeRegistro: this.resolveEntityValue(
                data.empresa?.co_entidade_registro
              ),
              cep: cepStr,
              endereco: data.empresa?.endereco?.ds_logradouro || '',
              numero: data.empresa?.endereco?.co_numero || '',
              bairro: data.empresa?.endereco?.ds_bairro || '',
              complemento: data.empresa?.endereco?.ds_complemento || '',
              estado: data.empresa?.endereco?.ds_uf || '',
            },
            { emitEvent: false }
          );

          if (data.empresa?.endereco?.ds_uf) {
            this.loadCities(
              data.empresa.endereco.ds_uf,
              data.empresa.endereco.ds_municipio ?? ''
            );
          }

          this.cadastroForm.markAsPristine();
          this.cadastroForm.markAsUntouched();
        },
        error: (err) => {
          console.error('Erro ao carregar dados do ID:', err);
          this.toastService.error(
            'Erro ao carregar dados. Por favor, tente novamente.'
          );
        },
      });
  }

  public onSubmit(): void {
    if (this.cadastroForm.valid) {
      this.createOrUpdateEntry();
    } else {
      this.cadastroForm.markAllAsTouched();
      console.error('Please fill in all required fields correctly!');
    }
  }

  private mapFormToPayload(): any {
    const rawValues = this.cadastroForm.getRawValue();
    return {
      solicitante: {
        ds_responsavel: rawValues.responsavel,
        nu_cpf: rawValues.cpf,
        date_nascimento: rawValues.dataNascimento,
      },
      empresa: {
        ds_nome_fantasia: rawValues.nomeFantasia,
        co_entidade_registro: rawValues.entidadeRegistro,
        endereco: {
          ds_logradouro: rawValues.endereco,
          co_numero: String(rawValues.numero) || '',
          ds_complemento: rawValues.complemento || '',
          ds_bairro: rawValues.bairro,
          ds_municipio: rawValues.cidade,
          ds_uf: rawValues.estado,
          co_cep: rawValues.cep,
        },
      },
      status: 'Aprovado',
      created_at: this.today,
    };
  }

  private createOrUpdateEntry(): void {
    const payload = this.mapFormToPayload();

    if (this.isEditMode && this.currentId) {
      this.companyService
        .updateCompany(this.currentId, payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.toastService.success(
              'Solicitação atualizada com sucesso',
              '/'
            );
          },
          error: (err) => {
            console.error('Erro ao atualizar a solicitação:', err);
            this.toastService.error(
              'Erro ao atualizar a solicitação. Por favor, tente novamente.'
            );
          },
        });
    } else {
      this.companyService
        .createCompany(payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.toastService.success('Solicitação criada com sucesso', '/');
          },
          error: (err) => {
            console.error('Erro ao criar a solicitação:', err);
            this.toastService.error(
              'Erro ao criar a solicitação. Por favor, tente novamente.'
            );
          },
        });
    }
  }

  public goBack(): void {
    this.toastService.info(
      'Deseja realmente sair sem terminar as alterações?',
      () => this.router.navigate(['/'])
    );
  }
}
