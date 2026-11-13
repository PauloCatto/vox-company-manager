# 📊 Vox Company Manager — Gestão Societária & BI Analytics

Aplicação corporativa desenvolvida em **Angular 17 (Standalone Components)** para gestão de solicitações de abertura de empresas e **Business Intelligence (BI)** em tempo real, integrada às APIs oficiais do **IBGE** e **ViaCEP**.

---

## 🚀 Como rodar o projeto

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/PauloCatto/vox-company-manager.git
   cd vox-company-manager
   ```

2. **Instale as dependências:**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Inicie o Frontend + Mock API (JSON Server) simultaneamente:**
   ```bash
   npm run dev
   ```
   - **Aplicação Angular:** `http://localhost:4200`
   - **Dashboard BI Executivo:** `http://localhost:4200/dashboard`
   - **Mock API (JSON Server):** `http://localhost:3000`

---

## ✨ Destaques da Arquitetura & Funcionalidades

### 1. Módulo de Business Intelligence (BI & Analytics) 📈
- **KPIs Executivos:** Total de empresas ativas, Taxa de Aprovação do funil societário, Cobertura Geográfica (UFs e Municípios) e Entidade Registradora líder.
- **Visualizações Analíticas:**
  - *Share por Entidade de Registro* (Junta Comercial, RFB, Cartório, OAB) com barra proporcional empilhada e detalhamento percentual.
  - *Ranking Geográfico por UF (IBGE)* com distribuição de volume por estado.
  - *Evolução Mensal de Solicitações* no semestre.
  - *Pipeline Operacional & Demografia* por faixa etária dos sócios responsáveis.
- **Filtros Multidimensionais & Exportação CSV:** Filtragem combinada por Entidade, Estado (UF) e Status com geração instantânea de relatório `.csv` compatível com Excel/Power BI.

### 2. Gestão de Pedidos Societários (`/home`) 🏢
- Busca reativa em tempo real por Nome Fantasia, Responsável, CPF ou Município.
- Filtros rápidos por Entidade de Registro e UF.
- Painel lateral de inspeção detalhada (Master-Detail View) com formatação de CPF, CEP, datas timezone-safe e badges de status.

### 3. Formulário Reativo Inteligente (`/company-registration`) 🧩
- **Integração ViaCEP:** Preenchimento automático de Logradouro, Bairro, UF e Município ao digitar os 8 dígitos do CEP.
- **Integração IBGE:** Carregamento dinâmico de Estados e Municípios em cascata.
- **Modo Criação e Edição Unificados:** Preservação de estado `pristine`/`untouched` e resolução consistente do código da Entidade de Registro (`co_entidade_registro`).
