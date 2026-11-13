📌 Case Vox — Frontend

Aplicação para gestão e cadastro de empresas.
Voltada para qualidade de código, experiência do usuário, formulários reativos, integrações externas e testes unitários.

🚀 Como rodar o projeto

📥 Clone o repositório:

git clone https://github.com/PauloCatto/case-vox-fe.git


📂 Entre na pasta:

cd case-vox-frontend


📦 Instale as dependências:

npm install --legacy-peer-deps

⚡ App + Mock API juntos:

npm run dev


🧪 Rodar testes com coverage:

npm test -- --code-coverage

✅ Funcionalidades em Destaque
<br>

1️⃣ Formulário Reativo com Validações 🔍

✔ Construído com FormBuilder + ReactiveFormsModule
<br>
✔ Mensagens de erro inteligentes e reativas
<br>
✔ Validações completas:

CPF → 11 dígitos

CEP → 8 dígitos

Datas e campos obrigatórios com feedback visual
<br>
✔ Função onlyNumbers() → protege entrada e formato no input

2️⃣ Modo de Edição e Criação em Uma Tela ✨
<br>
<br>
✔ Detecta via parâmetro id da rota
<br>
✔ Em edição:

Carrega dados via getCompanyById()

Mantém pristine/untouched após popular o formulário
<br>
✔ Lógica centralizada para:

createCompany()

updateCompany()

3️⃣ Integração com API do IBGE 🗺️

✔ Carrega estados na inicialização
<br>
✔ Carrega cidades reativamente conforme o estado
<br>
✔ Campo cidade desabilitado até seleção do estado
<br>
✔ Loading dedicado (loadingCities)
<br>
<br>
4️⃣ UX aprimorado com Loadings 🌀
<br>
<br>
✅ Indicadores visuais durante requisições
<br>
✅ Spinner profissional e centralizado na tela:

5️⃣ Criação e Atualização Organizadas 🧩
<br>
<br>
✔ mapFormToPayload() → garante estrutura correta remota
<br>
✔ Feedback via ToastService
<br>
✔ Redirecionamento claro e fluido após envio
<br>

6️⃣ Deletar Empresas 🗑️
<br>
✔ Funcionalidade de exclusão de empresas diretamente da lista
<br>
✔ Confirmação antes de deletar para evitar remoções acidentais
<br>
✔ Atualiza a UI em tempo real após exclusão
<br>
✔ Feedback visual via ToastService após sucesso ou falha
<br>

7️⃣ Navegação Segura 🛡
<br>
<br>
✔ goBack() com confirmação → previne perda acidental
<br>
✔ SPA real usando Router
<br>
<br>
8️⃣ Boas Práticas Angular ✅

Standalone Components

inject() no lugar de constructor

Limpeza de observables com takeUntil + ngOnDestroy

finalize() garantindo estado seguro mesmo em erro

🧪 Testes Unitários (Jasmine + Karma)

Cobertura:

Cenário	Coberto ✅
<br>
Criação de empresa	✅
<br>
Validação de formulários	✅
<br>
Integração IBGE (estados/cidades)	✅
<br>
Serviços (mock via spyOn)	✅
<br>
Feedback visual com Toasts	✅
<br>

<br>
<img width="1021" height="682" alt="Captura de tela 2025-10-27 015943" src="https://github.com/user-attachments/assets/89f8fe19-e08b-4247-ae6c-4a165dc1600a" />
<br>
