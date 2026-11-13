export interface Endereco {
  co_cep: string | number;
  ds_logradouro: string;
  co_numero: string;
  ds_complemento?: string | null;
  ds_bairro: string;
  ds_municipio: string;
  ds_uf: string;
}

export interface Empresa {
  ds_nome_fantasia: string;
  co_entidade_registro: string | number;
  endereco: Endereco;
}

export interface Solicitante {
  ds_responsavel: string;
  nu_cpf: string;
  date_nascimento: string;
}

export interface Company {
  id?: string;
  solicitante: Solicitante;
  empresa: Empresa;
  companyName: string;
}

export interface EntityRegistry {
  key: number | string;
  value: string;
}
