# Guia Completo Do Projeto VivaUnimed

## Objetivo deste guia

Este arquivo foi escrito a partir da leitura da estrutura do monorepo, dos scripts, das configuracoes de ambiente, do backend, dos frontends, dos jobs e dos testes. A ideia aqui e explicar:

- como instalar as dependencias;
- como executar o projeto de forma previsivel;
- como o sistema realmente funciona hoje;
- quais partes ja estao integradas;
- quais partes ainda sao mockadas ou precisam de ajuste.

## Resumo rapido

Hoje o repositorio e um monorepo `npm workspaces` com 4 pacotes:

- `backend`: API Node.js + TypeScript + Express + TSOA + Sequelize + PostgreSQL.
- `shared`: tipos compartilhados entre backend e frontend.
- `frontend/admin`: painel administrativo em React + Vite.
- `frontend/client`: interface do paciente em React + Vite.

O estado real do projeto hoje e este:

- o `backend` compila e expoe a API em `/api`;
- o `shared` compila normalmente;
- os dois frontends compilam normalmente;
- o `backend` depende de PostgreSQL para subir;
- o `backend` cria/atualiza tabelas automaticamente com `sequelize.sync({ alter: true })`;
- existe criacao automatica de usuario admin, se as variaveis forem preenchidas;
- os jobs de fila inteligente rodam no backend;
- boa parte do `frontend/admin` ainda usa dados mockados e `localStorage`, sem consumir a API real;
- o `frontend/client` usa a API real apenas no login; o restante das telas e majoritariamente estatico/mockado.

## Estrutura do monorepo

```text
.
|-- backend/
|-- frontend/
|   |-- admin/
|   `-- client/
|-- shared/
|-- Dockerfile
|-- docker-compose.yaml
|-- docker-compose.local.yaml
`-- traefik.yaml
```

### Papel de cada parte

#### `shared`

Centraliza os contratos de dominio:

- usuarios;
- perfis e permissoes;
- pacientes;
- medicos;
- especialidades;
- vagas (`appointment`);
- solicitacoes de fila (`appointment_request`);
- matches de fila (`appointment_match`).

O backend importa `shared` em runtime, entao ele precisa estar compilado antes de subir.

#### `backend`

O backend contem:

- autenticacao JWT;
- CRUD de usuarios;
- CRUD de medicos;
- CRUD de pacientes;
- CRUD de especialidades;
- CRUD de vagas;
- CRUD de solicitacoes de fila;
- fluxo de match entre vaga e fila;
- Swagger em `/api/docs`;
- jobs de expirar vagas, selecionar pacientes e disparar notificacoes.

#### `frontend/admin`

O admin contem telas para:

- dashboard;
- profissionais;
- pacientes;
- especialidades;
- vagas;
- agenda semanal;
- configuracoes.

Importante: varias dessas telas ainda funcionam como prototipo de interface, com dados em memoria ou `localStorage`, sem integracao completa com o backend.

#### `frontend/client`

O client contem telas para:

- login;
- cadastro;
- recuperacao de senha;
- consultas;
- alertas;
- interesses;
- perfil;
- vagas.

Importante: hoje o login conversa com a API real, mas o restante da experiencia do paciente ainda esta majoritariamente mockado.

## Como o backend realmente funciona

### Banco de dados

O backend usa PostgreSQL via Sequelize.

Ao iniciar:

1. carrega configuracao com `dotenv`;
2. conecta no PostgreSQL;
3. tenta criar o banco informado, caso ele nao exista;
4. executa `sequelize.sync({ alter: true })`;
5. inicia o servidor HTTP;
6. inicia os jobs;
7. cria um admin padrao se `DEFAULT_ADMIN_EMAIL` e `DEFAULT_ADMIN_PASSWORD` estiverem preenchidos.

### Observacao importante sobre criacao do banco

O metodo `createDatabaseIfNotExists()` tenta conectar primeiro no banco `postgres` com o mesmo usuario/senha informados. Isso significa:

- se o usuario tiver permissao para criar banco, o backend consegue criar o banco automaticamente;
- se o usuario nao tiver permissao, a tentativa falha silenciosamente e o banco de destino precisa ja existir;
- em banco gerenciado, isso costuma exigir que o database alvo ja esteja criado antes.

### Autenticacao

O backend suporta JWT de dois jeitos:

- header `Authorization: Bearer <token>`;
- cookie `X-VIVA-TOKEN`.

Rotas importantes:

- `POST /api/auth/login`
- `GET /api/auth/logout`
- `GET /api/user/me`

### Perfis e permissoes

Perfis existentes:

- `Admin`
- `Tecnico`
- `Paciente`

O `Admin` recebe todas as permissoes listadas em `shared/src/permissions.ts`.

### Fila inteligente

O coracao da logica esta em:

- `appointment.service.ts`
- `appointment_request.service.ts`
- `appointment_match.job.ts`
- `appointment_notification.job.ts`

Fluxo resumido:

1. uma vaga e criada em `appointment`;
2. pacientes entram na fila em `appointment_request`;
3. o job de match procura vagas abertas;
4. seleciona os proximos pacientes elegiveis;
5. cria registros em `appointment_match`;
6. o job de notificacao envia a notificacao;
7. o paciente pode confirmar, recusar ou cancelar o match.

### Limite atual das notificacoes

Hoje a notificacao nao envia WhatsApp, SMS, e-mail ou push real. O provider atual e apenas:

- `backend/src/provider/notification/console_notification.provider.ts`

Ou seja: as "notificacoes" aparecem no log do backend.

## O que esta integrado e o que ainda e mock

### Backend

Esta funcional como API e e a parte mais completa do repositorio.

### Frontend admin

Login:

- usa `POST /api/auth/login`;
- depende do backend real.

Restante do admin:

- `patients` persiste em `localStorage`;
- `vacancies` persiste em `localStorage`;
- `professionals` usa dados mockados em memoria;
- `specialties` usa estado local de tela;
- `weekly schedule` usa estado local e dados fake;
- `dashboard` e demonstrativo;
- nao existe integracao completa com os endpoints reais do backend.

Consequencia pratica:

- criar medico/paciente/especialidade pela API nao atualiza automaticamente o admin;
- navegar no admin serve bem para validar interface e fluxo visual;
- para validar regra de negocio real do backend, o melhor caminho hoje e Swagger/Postman/Insomnia.

### Frontend client

Login:

- usa `POST /api/auth/login`.

Modo demo:

- se voce clicar em entrar com email e senha vazios, a tela faz `demoLogin()` e entra sem backend.

Cadastro e reset de senha:

- chamam endpoints `/usuarios/...`;
- esses endpoints nao existem no backend atual deste repositorio.

Logout:

- o frontend chama `POST /api/auth/logout`;
- o backend expoe `GET /api/auth/logout`;
- na pratica o frontend limpa o `localStorage/sessionStorage`, mas a chamada server-side esta desalinhada.

## Pre-requisitos recomendados

Para desenvolvimento local:

- Node.js 24 ou proximo disso;
- npm;
- PostgreSQL;
- Docker opcional.

Motivo do Node 24:

- o `Dockerfile` usa `node:24`;
- isso reduz divergencia entre ambiente local e container.

## Instalando as dependencias

Na raiz do projeto:

```bash
npm install
```

Como o projeto usa `workspaces`, esse comando instala as dependencias de todos os pacotes.

## Configurando ambiente

Existem dois contextos diferentes de `.env` neste projeto.

### 1. Backend rodando localmente com `npm`

Use o arquivo de exemplo dentro de `backend/`:

```bash
cp backend/.env.example backend/.env
```

Esse e o arquivo mais importante para desenvolvimento local do backend.

Motivo: quando voce roda `npm -w backend ...`, o processo executa com `cwd` em `backend/`, entao o `dotenv` le `backend/.env`.

#### Variaveis principais do backend

- `SERVER_PORT`: porta da API. Default do projeto: `3000`.
- `CORS_ORIGINS`: origens separadas por virgula. Exemplo:
  `http://localhost:5173,http://localhost:5174`
- `DB_ADDRESS`: host do PostgreSQL.
- `DB_PORT`: porta do PostgreSQL.
- `DB_DATABASE`: nome do banco.
- `DB_ENABLE_SSL`: `true` ou `false`.
- `DB_USERNAME`: usuario do banco.
- `DB_PASSWORD`: senha do banco.
- `DEFAULT_ADMIN_EMAIL`: admin inicial.
- `DEFAULT_ADMIN_PASSWORD`: senha do admin inicial.
- `JWT_SECRET`: segredo do JWT.
- `APPOINTMENT_JOB_CRON`: agenda do job de match.
- `APPOINTMENT_MIN_LEAD_MINUTES`: antecedencia minima para criar vaga.
- `APPOINTMENT_SLOT_MINUTES`: janela usada para evitar conflito de agenda.
- `APPOINTMENT_REQUEST_MAX_ATTEMPTS`: tentativas maximas por solicitacao.
- `APPOINTMENT_REQUEST_BACKOFF_MINUTES`: cooldown inicial.
- `APPOINTMENT_REQUEST_BACKOFF_MULTIPLIER`: multiplicador do cooldown.

### 2. Docker Compose / ambiente mais parecido com deploy

Use o arquivo de exemplo na raiz:

```bash
cp .env.example .env
```

Esse arquivo e usado pelo `docker-compose.yaml` para interpolacao de variaveis do compose.

Observacao:

- o `.env.example` da raiz nao substitui o `backend/.env.example` para o fluxo local com `npm`;
- pense assim:
  - `backend/.env` para backend local;
  - `.env` da raiz para compose da raiz.

## Como subir localmente do jeito mais previsivel

Este e o fluxo que eu recomendo para desenvolvimento.

### 1. Suba o PostgreSQL

Voce pode usar seu PostgreSQL ja instalado ou um container.

Exemplo com Docker:

```bash
docker run --name viva-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=12345678 \
  -e POSTGRES_DB=viva_unimed \
  -p 5432:5432 \
  -d postgres:17
```

Depois ajuste o `backend/.env`.

Exemplo de configuracao local:

```env
SERVER_PORT=3000
CORS_ORIGINS=http://localhost:5173,http://localhost:5174
DB_ADDRESS=localhost
DB_PORT=5432
DB_DATABASE=viva_unimed
DB_ENABLE_SSL=false
DB_USERNAME=postgres
DB_PASSWORD=12345678
DEFAULT_ADMIN_EMAIL=admin@viva.com
DEFAULT_ADMIN_PASSWORD=123456
JWT_SECRET=troque-esta-chave
APPOINTMENT_JOB_CRON=0/1 * * * 1-5
```

### 2. Suba o backend

Na raiz:

```bash
npm run backend
```

Esse script faz:

1. build do `shared`;
2. build de rotas/swagger do backend;
3. build TypeScript do backend;
4. start da API.

URLs importantes:

- health: `http://localhost:3000/api/health`
- swagger: `http://localhost:3000/api/docs`

### 3. Suba o admin

Em outro terminal, na raiz:

```bash
npm run admin
```

Abra a URL informada pelo Vite. Normalmente:

- `http://localhost:5173/admin/`

Observacoes:

- o admin usa `base: '/admin/'`;
- se outra app ja estiver rodando, o Vite pode escolher outra porta;
- confira a porta real no terminal.

### 4. Suba o client

Em outro terminal, na raiz:

```bash
npm run client
```

Abra a URL informada pelo Vite. Normalmente:

- `http://localhost:5174/`

Se o client for o primeiro Vite a subir, ele pode usar `5173`.

### 5. Login inicial

Se voce configurou:

- `DEFAULT_ADMIN_EMAIL=admin@viva.com`
- `DEFAULT_ADMIN_PASSWORD=123456`

o backend cria esse admin automaticamente na primeira subida, caso ele ainda nao exista.

## Como usar o projeto no estado atual

### Para validar backend de verdade

O caminho mais confiavel hoje e:

1. subir backend + Postgres;
2. abrir `http://localhost:3000/api/docs`;
3. testar os endpoints pelo Swagger.

Isso e especialmente util para validar:

- criacao de usuarios;
- especialidades;
- medicos;
- pacientes;
- vagas;
- fila de espera;
- matches.

### Para navegar no admin

Use o admin principalmente para:

- testar layout;
- fluxo visual;
- navegacao;
- estados de lista/tela.

Nao assuma hoje que o admin reflete automaticamente os dados reais do banco.

### Para navegar no client

Voce tem duas opcoes:

- login real via backend;
- demo login deixando email e senha vazios na tela de login.

O demo login e util para explorar a interface rapidamente.

## Docker: como o projeto esta montado

Existem dois compose files.

### `docker-compose.yaml`

E um stack mais parecido com producao:

- `traefik`
- `api`
- `front-admin`
- `front-client`

Ele espera:

- banco externo;
- variaveis definidas na raiz;
- rede `traefik-net`;
- roteamento por Traefik.

### `docker-compose.local.yaml`

Ele estende o compose principal e adiciona:

- `db` com `postgres:17`;
- `internal-net`;
- variaveis default locais para o backend.

### Ponto de atencao importante no Docker local

No estado atual dos arquivos:

- `api`, `front-admin` e `front-client` nao expoem portas diretas no host;
- o acesso passa pelo Traefik;
- os routers estao presos ao entrypoint `websecure`;
- as labels exigem TLS e `certresolver=letsencrypt`.

Na pratica, isso significa que o compose local e mais "production-like" do que "plug and play" para localhost.

Para tentar subir:

```bash
docker compose -f docker-compose.local.yaml up --build
```

Mas para desenvolvimento diario, o caminho mais previsivel continua sendo rodar localmente com `npm`.

### Dashboard do Traefik

Se o Traefik subir corretamente, o dashboard esta configurado em:

- `http://localhost:8080`

### Banco do compose local

O Postgres do `docker-compose.local.yaml` nao publica a porta `5432` no host por padrao.

Entao:

- o backend no compose consegue acessar o banco internamente;
- seu cliente SQL local nao consegue acessar sem adicionar ou descomentar o `ports`.

## Endpoints principais da API

### Auth

- `POST /api/auth/login`
- `GET /api/auth/logout`

### Health

- `GET /api/health`

### Usuario

- `POST /api/user`
- `GET /api/user`
- `GET /api/user/me`
- `GET /api/user/{id}`
- `PUT /api/user/{id}/roles`
- `DELETE /api/user/{id}/roles`

### Especialidade

- `POST /api/speciality`
- `PUT /api/speciality/{id}`
- `GET /api/speciality`
- `GET /api/speciality/{id}`
- `DELETE /api/speciality/{id}`

### Medico

- `POST /api/doctor`
- `PUT /api/doctor/{id}`
- `GET /api/doctor`
- `GET /api/doctor/{id}`
- `POST /api/doctor/{id}/speciality`
- `DELETE /api/doctor/{id}/speciality`
- `DELETE /api/doctor/{id}`

### Paciente

- `POST /api/patient`
- `PUT /api/patient/{id}`
- `GET /api/patient`
- `GET /api/patient/{id}`
- `DELETE /api/patient/{id}`

### Vagas

- `POST /api/appointment`
- `GET /api/appointment`
- `GET /api/appointment/{id}`
- `DELETE /api/appointment/{id}`

### Solicitacoes de fila

- `POST /api/appointment-request`
- `PUT /api/appointment-request/{id}`
- `GET /api/appointment-request`
- `GET /api/appointment-request/{id}`
- `DELETE /api/appointment-request/{id}`

### Match da fila

- `GET /api/match/{id}`
- `POST /api/match/{id}/confirm`
- `POST /api/match/{id}/reject`
- `POST /api/match/{id}/cancel`

## Builds e testes

### Builds

Os comandos de build relevantes sao:

```bash
npm -w shared run build
npm -w backend run build
npm -w frontend/admin run build
npm -w frontend/client run build
```

No estado atual do repositorio, esses builds funcionam depois de `npm install`.

### Testes do backend

Comando:

```bash
npm -w backend test
```

Ponto importante: os testes usam configuracao hardcoded em `backend/test/setup.ts`:

- host: `localhost`
- porta: `5432`
- usuario: `postgres`
- senha: `12345678`

Eles criam um banco temporario com nome parecido com:

- `test_viva_<timestamp>`

Entao, para os testes passarem sem editar codigo, voce precisa de um PostgreSQL local compativel com essas credenciais.

## Principais limitacoes e desalinhamentos atuais

### 1. Signup e reset de senha do frontend nao batem com o backend

Os frontends chamam:

- `/usuarios/signup`
- `/usuarios/reset-password-request`
- `/usuarios/reset-password-confirm`

Essas rotas nao existem no backend atual.

### 2. Logout do frontend nao bate com o backend

- frontend chama `POST /api/auth/logout`
- backend implementa `GET /api/auth/logout`

### 3. Admin nao e um cliente completo da API ainda

Muitas telas usam:

- mocks;
- estado local;
- `localStorage`;
- dados de demonstracao.

### 4. Notificacao real ainda nao existe

Hoje a notificacao da fila vai apenas para o console do backend.

### 5. Nao existem migrations formais

O schema e alterado automaticamente com:

```ts
sequelize.sync({ alter: true })
```

Isso acelera desenvolvimento, mas exige cautela em ambientes compartilhados ou de producao.

### 6. O compose local ainda precisa de carinho para localhost

O stack Docker foi montado com cara de deploy com Traefik/TLS, nao como setup local simples com portas diretas.

## Fluxo recomendado de trabalho

Se voce quer produtividade no dia a dia, eu recomendo este fluxo:

1. rode um PostgreSQL local ou em container;
2. configure `backend/.env`;
3. suba o backend com `npm run backend`;
4. use `http://localhost:3000/api/docs` para validar a API real;
5. suba `npm run admin` e `npm run client` para navegar nas interfaces;
6. trate o admin e o client, por enquanto, mais como interface/prototipo do que como espelho fiel do banco.

## Checklist rapido

```bash
# 1. instalar dependencias
npm install

# 2. preparar backend local
cp backend/.env.example backend/.env

# 3. subir backend
npm run backend

# 4. subir admin
npm run admin

# 5. subir client
npm run client
```

## Arquivos que valem a leitura

- `package.json`
- `backend/package.json`
- `backend/src/app.ts`
- `backend/src/config.ts`
- `backend/src/db/database.ts`
- `backend/src/service/appointment.service.ts`
- `backend/src/service/appointment_request.service.ts`
- `backend/src/jobs/appointment_match.job.ts`
- `backend/src/jobs/appointment_notification.job.ts`
- `frontend/admin/src/routes/index.jsx`
- `frontend/client/src/routes/index.jsx`
- `docker-compose.yaml`
- `docker-compose.local.yaml`
- `Dockerfile`

## Conclusao

Se o objetivo for desenvolver backend e regra de negocio, este repositorio ja oferece uma boa base funcional. Se o objetivo for usar os frontends como cliente completo da API, ainda existe trabalho de integracao a fazer.

Para subir e mexer no projeto hoje sem dor de cabeca, priorize:

- `npm install`;
- `backend/.env`;
- PostgreSQL local;
- backend em `localhost:3000`;
- Swagger para testar a API real;
- frontends para navegar e validar interface.
