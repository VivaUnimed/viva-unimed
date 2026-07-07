# Viva Unimed Backend

Este README foi atualizado para refletir o backend atual do projeto. O foco aqui e servir como:

- documentacao tecnica do backend;
- referencia de setup local;
- contrato de integracao para frontend e testes manuais;
- mapa dos gaps e comportamentos assincronos que ja existem no sistema.

## Visao geral

Stack principal:

- Node.js + TypeScript
- Express 5
- TSOA para controllers, rotas e OpenAPI
- Sequelize + PostgreSQL
- JWT para autenticacao
- `cron` para jobs de fila
- workspace `shared` para tipos compartilhados

Organizacao:

- `src/api`: controllers, guards e middlewares
- `src/service`: regras de negocio
- `src/db/models`: models Sequelize e relacionamentos
- `src/jobs`: processamento assincrono de vagas e notificacoes
- `src/provider`: integracoes externas; hoje a notificacao vai para console
- `../shared`: tipos compartilhados com outros pacotes

## Fonte de verdade do contrato

Para quem for integrar com o backend, a ordem de confianca deve ser:

1. comportamento real implementado em `controllers + services + models`;
2. Swagger/OpenAPI gerado pelo TSOA;
3. tipos do workspace `shared`.

Importante:

- ainda existem pequenos desalinhamentos em `shared`, principalmente nomes como `createAt` vs `createdAt` e `specialitie` vs `speciality`;
- datas devem ser tratadas como `string` no wire format, mesmo quando o tipo TS aparece como `Date`.

## Como subir

### Variaveis de ambiente

Lidas por `src/config.ts`:

| Variavel | Obrigatoria | Default | Observacao |
| --- | --- | --- | --- |
| `SERVER_PORT` | nao | `3000` | Porta HTTP |
| `CORS_ORIGINS` | nao | vazio | Lista separada por virgula |
| `DB_ADDRESS` | sim | - | Host do Postgres |
| `DB_PORT` | nao | `5432` | Porta do Postgres |
| `DB_USERNAME` | sim | - | Usuario do banco |
| `DB_PASSWORD` | sim | - | Senha do banco |
| `DB_DATABASE` | sim | - | Nome do banco |
| `DB_ENABLE_SSL` | nao | `false` | SSL para banco gerenciado |
| `JWT_SECRET` | nao | valor padrao inseguro | Trocar em producao |
| `DEFAULT_ADMIN_EMAIL` | nao | vazio | Cria admin no boot se vier junto com senha |
| `DEFAULT_ADMIN_PASSWORD` | nao | vazio | Cria admin no boot se vier junto com email |
| `APPOINTMENT_JOB_CRON` | nao | `0/5 8-20 * * 1-5` | Agenda do job de match |
| `APPOINTMENT_MIN_LEAD_MINUTES` | nao | `30` | Antecedencia minima da vaga |
| `APPOINTMENT_SLOT_MINUTES` | nao | `30` | Janela para bloquear choque de agenda |
| `APPOINTMENT_REQUEST_MAX_ATTEMPTS` | nao | `3` | Limite de tentativas por request |
| `APPOINTMENT_REQUEST_BACKOFF_MINUTES` | nao | `10` | Cooldown inicial |
| `APPOINTMENT_REQUEST_BACKOFF_MULTIPLIER` | nao | `2` | Multiplicador do cooldown |
| `PASSWORD_RESET_TOKEN_EXPIRATION_MINUTES` | nao | `15` | Configurada, mas ainda sem fluxo real exposto |

### Arquivo `.env`

Quando voce roda o backend via workspace, o processo executa no diretorio `backend/`. Na pratica, o arquivo esperado e:

```bash
backend/.env
```

Exemplo minimo para desenvolvimento local:

```env
DB_ADDRESS=localhost
DB_PORT=5432
DB_DATABASE=viva_unimed
DB_ENABLE_SSL=false
DB_USERNAME=postgres
DB_PASSWORD=12345678

DEFAULT_ADMIN_EMAIL=admin@viva.com
DEFAULT_ADMIN_PASSWORD=123456
```

Exemplo mais explicito:

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

JWT_SECRET=dev_viva_unimed_local_secret_change_me

APPOINTMENT_JOB_CRON=0/1 * * * 1-5
APPOINTMENT_MIN_LEAD_MINUTES=30
APPOINTMENT_SLOT_MINUTES=30
APPOINTMENT_REQUEST_MAX_ATTEMPTS=3
APPOINTMENT_REQUEST_BACKOFF_MINUTES=10
APPOINTMENT_REQUEST_BACKOFF_MULTIPLIER=2
PASSWORD_RESET_TOKEN_EXPIRATION_MINUTES=15
```

### Comandos

Na raiz do monorepo:

```bash
npm install
npm run backend
```

O script `npm run backend` faz:

1. build do workspace `shared`;
2. geracao de rotas e spec TSOA;
3. compilacao do backend;
4. execucao de `node dist/index.js`.

### URLs uteis

- `GET /api/health`
- `GET /api/swagger.json`
- `GET /api/docs`

## Estado atual do backend

No estado atual do repositorio:

- `npm -w shared run build` funciona;
- `npm -w backend run build` funciona;
- o backend sobe corretamente com PostgreSQL disponivel;
- o admin default e criado no boot quando `DEFAULT_ADMIN_EMAIL` e `DEFAULT_ADMIN_PASSWORD` estao definidos;
- os jobs de match e notificacao iniciam junto com a API.

### Observacoes operacionais

- o backend usa `sequelize.sync({ alter: true })` no boot;
- nao existe sistema formal de migracoes ainda;
- o banco alvo e testado com `SELECT 1`;
- o backend tambem tenta criar o database informado caso ele nao exista, conectando antes ao database `postgres`.

## Contrato global da API

### Base URL

- prefixo da API: `/api`

### Formato

- requests e responses usam JSON;
- datas saem como string ISO 8601 no JSON;
- o TSOA esta configurado com `noImplicitAdditionalProperties: "silently-remove-extras"`.

Na pratica:

- o frontend deve modelar datas como `string` na camada HTTP;
- campos extras enviados no body podem ser descartados silenciosamente antes do controller.

### Contrato de erros

Tratamento central em `src/api/middleware/error.middleware.ts`:

| Status | Corpo |
| --- | --- |
| `400` | `{ "message": "BadRequest", "details": string }` |
| `401` | `{ "message": "Unauthorized", "details": "" }` ou `{ "message": "Unauthorized" }` em falhas fora do middleware |
| `403` | `{ "message": "Forbidden", "requires": Permission[] }` |
| `404` | `{ "message": "NotFound", "details": "" }` |
| `409` | `{ "message": "Conflict", "details": string }` |
| `422` TSOA | `{ "message": "Validation Failed", "details": {...} }` |
| `422` Joi | `{ "message": "Validation Failed", "info": string, "details": [...] }` |
| `500` | `{ "message": "Internal Server Error" }` |

Observacoes:

- o `message` de `ApiError` usa o nome da classe, como `Conflict`, `NotFound` e `BadRequest`;
- varios conflitos de dominio devolvem detalhes textuais importantes; o frontend deve exibi-los quando fizer sentido.

### CORS

Hoje existe middleware de CORS no app:

- `credentials: true`
- metodos: `GET`, `POST`, `PUT`, `DELETE`, `PATCH`, `OPTIONS`
- headers permitidos: `Content-Type`, `Authorization`
- origem: vem de `CORS_ORIGINS`

## Autenticacao e autorizacao

### Login

`POST /api/auth/login`

Body:

```json
{
  "email": "admin@viva.com",
  "password": "123456"
}
```

Comportamento:

- autentica por email e senha;
- gera JWT com expiracao de `1h`;
- devolve cookie HttpOnly `X-VIVA-TOKEN=Bearer <token>`;
- tambem devolve o token no body.

Response:

```json
{
  "id": 1,
  "name": "admin",
  "email": "admin@viva.com",
  "token": "<jwt>"
}
```

### Logout

`GET /api/auth/logout`

Comportamento:

- apaga o cookie `X-VIVA-TOKEN`.

### Como o backend aceita sessao

O JWT pode vir por:

- header `Authorization: Bearer <token>`;
- cookie `X-VIVA-TOKEN`.

### Recomendacao para frontend

- em browser, prefira cookie HttpOnly com `credentials: "include"`;
- depois do login, faca `GET /api/user/me` para carregar `roles` e `permissions`;
- derive menus e acoes da UI a partir de `permissions`.

### Roles e permissions atuais

Mapeamento em `src/entities/roles.ts`:

#### `Admin`

Recebe todas as permissions do sistema.

#### `Tecnico`

- `schedule.aprove`
- `user.read`
- `speciality.read`
- `speciality.create`
- `speciality.edit`

#### `Paciente`

- `schedule.request`
- `speciality.read`

Observacao:

- varias rotas protegidas usam permissions como `doctor.read`, `patient.read`, `user.create` e afins;
- `POST /api/appointment` exige `appointment.create`, mas essa permission nao esta declarada em `shared/src/permissions.ts`;
- na pratica, a role `Admin` continua sendo a mais completa para operar o sistema atual.

## Contrato recomendado para a camada HTTP do frontend

Mesmo com `shared`, estes pontos sao os mais seguros:

- datas no wire format: `string`
- `createdAt` e `updatedAt` podem existir no JSON mesmo quando `shared` usa `createAt`
- campos relacionais opcionais podem nao vir populados

Tipos praticos:

```ts
type IsoDateString = string;

type Role = "Admin" | "Tecnico" | "Paciente";

type Permission =
  | "user.create"
  | "user.read"
  | "user.edit"
  | "user.edit.role"
  | "schedule.aprove"
  | "schedule.request"
  | "speciality.read"
  | "speciality.edit"
  | "speciality.create"
  | "speciality.delete"
  | "doctor.create"
  | "doctor.read"
  | "doctor.edit"
  | "doctor.delete"
  | "patient.create"
  | "patient.read"
  | "patient.edit"
  | "patient.delete";
```

## Endpoints

### Health

| Metodo | Rota | Auth | Response |
| --- | --- | --- | --- |
| `GET` | `/api/health` | nao | `{ status: "ok", timestamp: string }` |

### Auth

| Metodo | Rota | Auth | Body | Response |
| --- | --- | --- | --- | --- |
| `POST` | `/api/auth/login` | nao | `{ email, password }` | `IUser & { token: string }` |
| `GET` | `/api/auth/logout` | opcional | vazio | limpa cookie |

### User

| Metodo | Rota | Auth | Permission | Entrada | Response |
| --- | --- | --- | --- | --- | --- |
| `POST` | `/api/user` | sim | `user.create` | `IUserCreate` | `IUser` |
| `PUT` | `/api/user/{userId}/roles` | sim | `user.edit.role` | `{ role }` | vazio |
| `DELETE` | `/api/user/{userId}/roles` | sim | `user.edit.role` | `{ role }` | vazio |
| `GET` | `/api/user` | sim | `user.read` | query `nameLike?`, `emailLike?` | `IUser[]` |
| `GET` | `/api/user/me` | sim | somente sessao | vazio | `IUser` com `roles` e `permissions` |
| `GET` | `/api/user/{userId}` | sim | `user.read` | path `userId` | `IUser` com `roles` e `permissions` |

Notas:

- `POST /api/user` aceita `name`, `email`, `cpf?`, `phone?`, `password?`, `roles?`;
- o service de criacao hoje grava `name` e `email`, cria senha se existir `password` e atribui roles se existirem;
- `cpf` e `phone` aparecem no contrato de entrada, mas nao sao persistidos pelo `UserService.create()` atual;
- `GET /api/user` lista usuarios sem carregar `roles` e `permissions`;
- `GET /api/user/me` e `GET /api/user/{id}` devolvem `roles` e `permissions`.

### Speciality

| Metodo | Rota | Auth | Permission | Body | Response |
| --- | --- | --- | --- | --- | --- |
| `POST` | `/api/speciality` | sim | `speciality.create` | `{ name }` | `ISpeciality` |
| `PUT` | `/api/speciality/{id}` | sim | `speciality.edit` | `{ name }` | `ISpeciality` |
| `GET` | `/api/speciality/{id}` | sim | `speciality.read` | vazio | `ISpeciality` |
| `GET` | `/api/speciality` | sim | `speciality.read` | query `search?`, `page?`, `size?` | `ISpeciality[]` |
| `DELETE` | `/api/speciality/{id}` | sim | `speciality.delete` | vazio | vazio |

Notas:

- conflito por nome repetido devolve `409`;
- a listagem suporta busca por `name`;
- os endpoints atuais nao retornam a lista de doctors associados.

### Doctor

| Metodo | Rota | Auth | Permission | Body | Response |
| --- | --- | --- | --- | --- | --- |
| `POST` | `/api/doctor` | sim | `doctor.create` | `{ userId, crm, enabled }` | `IDoctor` |
| `PUT` | `/api/doctor/{id}` | sim | `doctor.edit` | `{ userId, crm, enabled }` | `IDoctor` |
| `POST` | `/api/doctor/{id}/speciality` | sim | `doctor.create` | `{ specialityId }` | vazio |
| `DELETE` | `/api/doctor/{id}/speciality` | sim | `doctor.create` | `{ specialityId }` | vazio |
| `GET` | `/api/doctor/{id}` | sim | `doctor.read` | vazio | `IDoctor` |
| `GET` | `/api/doctor` | sim | `doctor.read` | query `search?`, `specialityId?`, `page?`, `size?` | `IDoctor[]` |
| `DELETE` | `/api/doctor/{id}` | sim | `doctor.delete` | vazio | vazio |

Notas:

- o model usa `userId` como chave do medico;
- o retorno do service transforma isso em `id`, junto com `name`, `email`, `phone`, `crm`, `enabled` e `specialities`;
- `crm` com menos de 4 caracteres devolve `400`;
- CRM duplicado ou medico duplicado para o mesmo `userId` devolve `409`.

### Patient

| Metodo | Rota | Auth | Permission | Body | Response |
| --- | --- | --- | --- | --- | --- |
| `POST` | `/api/patient` | sim | `patient.create` | `{ userId, birth }` | `IPatient` |
| `PUT` | `/api/patient/{id}` | sim | `patient.edit` | `{ birth? }` | `IPatient` |
| `GET` | `/api/patient/{id}` | sim | `patient.read` | vazio | `IPatient` |
| `GET` | `/api/patient` | sim | `patient.read` | query `search?`, `page?`, `size?` | `IPatient[]` |
| `DELETE` | `/api/patient/{id}` | sim | `patient.delete` | vazio | vazio |

Notas:

- `getById` e `list` incluem dados do `UserModel`;
- o retorno atual do service e achatado, com `id`, `birth`, `email`, `name`, `phone` e `cpf`;
- a busca em `list` filtra por nome, cpf e email do usuario associado.

### Appointment

| Metodo | Rota | Auth | Permission | Body | Response |
| --- | --- | --- | --- | --- | --- |
| `POST` | `/api/appointment` | sim | `appointment.create` | `{ date, doctorId, specialityId }` | `IAppointment` |
| `GET` | `/api/appointment/{id}` | nao | vazio | `IAppointment` |
| `GET` | `/api/appointment` | nao | vazio | `IAppointment[]` |
| `DELETE` | `/api/appointment/{id}` | nao | vazio | vazio |

Notas importantes:

- o controller injeta `createdBy` com base em `req.user.userId`;
- o service sempre cria a vaga com `status: "open"`;
- o backend valida antecedencia minima;
- o backend valida se o medico possui a especialidade informada;
- o backend valida choque de agenda usando `APPOINTMENT_SLOT_MINUTES`;
- a rota exige `appointment.create`, mas essa permission ainda nao aparece em `shared/src/permissions.ts`;
- `GET` e `DELETE` ainda estao publicos hoje.

Exemplo de criacao:

```json
{
  "date": "2026-07-08T14:00:00.000Z",
  "doctorId": 12,
  "specialityId": 3
}
```

### Appointment Request

| Metodo | Rota | Auth | Body | Response |
| --- | --- | --- | --- | --- |
| `POST` | `/api/appointment-request` | nao | `{ patientId, specialityId, doctorId?, status, date }` | `IAppointmentRequest` |
| `PUT` | `/api/appointment-request/{id}` | nao | body parcial compativel com `IAppointmentRequestCreate` | `IAppointmentRequest` |
| `GET` | `/api/appointment-request/{id}` | nao | vazio | `IAppointmentRequest` |
| `GET` | `/api/appointment-request` | nao | query `patientId?`, `specialityId?`, `doctorId?`, `status?`, `page?`, `size?` | `IAppointmentRequest[]` |
| `DELETE` | `/api/appointment-request/{id}` | nao | vazio | vazio |

Notas importantes:

- para criar uma solicitacao nova, o valor esperado na pratica e `status: "waiting"`;
- se `doctorId` vier preenchido, o backend valida se o medico atende aquela especialidade;
- o backend bloqueia outra request `waiting` do mesmo paciente para a mesma especialidade;
- ao excluir uma request aprovada, o backend devolve `409`;
- se houver match pendente no momento da exclusao, ele e rejeitado antes da request virar `cancelled`.

Exemplo:

```json
{
  "patientId": 8,
  "specialityId": 3,
  "status": "waiting",
  "date": "2026-07-20T09:00:00.000Z"
}
```

### Match

| Metodo | Rota | Auth | Body | Response |
| --- | --- | --- | --- | --- |
| `GET` | `/api/match/{matchId}` | nao | vazio | `IAppointmentMatch` |
| `POST` | `/api/match/{matchId}/confirm` | nao | vazio | vazio |
| `POST` | `/api/match/{matchId}/reject` | nao | vazio | vazio |
| `POST` | `/api/match/{matchId}/cancel` | nao | vazio | vazio |

Notas importantes:

- ainda nao existe listagem de matches por paciente, usuario ou request;
- hoje o frontend so consegue consultar um match se ja souber o `matchId`;
- `confirm` reserva a vaga e aprova a request;
- `reject` marca o match como rejeitado e aplica cooldown;
- `cancel` desfaz um match aceito, respeitando as janelas de 15 minutos ou 24 horas.

## Regras de negocio mais importantes

### Appointment

- `open` pode virar `booked` ou `expired`
- `booked` pode virar `cancelled` ou `no_show`
- `expired`, `cancelled` e `no_show` sao estados finais

Validacoes atuais:

- vaga no passado: `400`
- vaga abaixo da antecedencia minima: `400`
- medico sem vinculo com a especialidade: `409`
- medico com conflito de agenda: `409`

### Appointment Request

- uma request nova entra com `attempts = 0` e `cooldownUntil = null`
- o backend considera elegiveis apenas requests `waiting`
- requests com `cooldownUntil > now` ficam temporariamente fora da fila
- requests que atingiram `APPOINTMENT_REQUEST_MAX_ATTEMPTS` deixam de ser elegiveis

### Match

Um match so pode ser confirmado quando:

- a vaga esta `open`
- a request esta `waiting`
- o match esta `waiting_response`
- `expiresAt` ainda nao passou

Ao confirmar:

- o match vencedor vira `accepted`
- a vaga vira `booked`
- os outros matches da mesma vaga viram `cancelled`
- a request vencedora vira `approved`

Ao rejeitar ou expirar:

- `attempts` sobe
- o backend calcula um novo `cooldownUntil`

Formula atual:

```text
backoffMinutes = APPOINTMENT_REQUEST_BACKOFF_MINUTES * (APPOINTMENT_REQUEST_BACKOFF_MULTIPLIER ^ (attempts - 1))
```

Ao cancelar um match aceito:

- o match precisa estar `accepted`
- a consulta nao pode estar no passado
- se faltarem menos de 24h para a consulta, o cancelamento so pode acontecer dentro de 15 minutos apos o aceite

## Fluxo da fila inteligente

### 1. Criacao da vaga

Um usuario autenticado cria um `appointment` e o backend salva:

- `date`
- `doctorId`
- `specialityId`
- `createdBy`
- `status: "open"`

### 2. Entrada na fila

O paciente cria um `appointment-request` com:

- `patientId`
- `specialityId`
- `doctorId` opcional
- `status: "waiting"`
- `date`

### 3. Job de matching

O `AppointmentMatchJob`:

- expira matches antigos;
- expira vagas abertas que ja passaram;
- busca appointments `open`;
- ignora vagas que ja tenham match ativo;
- mede o tamanho da fila elegivel para a vaga;
- escolhe uma estrategia dinamica.

Estrategia atual:

- se faltam menos de 48h para a consulta: envio em lote de ate 5 pessoas, expirando em 30 minutos
- se faltam 48h ou mais: envio sequencial, com expiracao dinamica

Expiracao dinamica:

- fila > 10: 30 minutos
- fila > 3: 60 minutos
- senao: 120 minutos

### 4. Job de notificacao

O `AppointmentNotificationJob` roda a cada 1 minuto e:

- busca matches `queued`
- carrega paciente, medico e especialidade
- escreve uma notificacao no console
- muda o match para `waiting_response`

### 5. Resposta do paciente

O paciente pode:

- confirmar: `POST /api/match/{id}/confirm`
- rejeitar: `POST /api/match/{id}/reject`
- cancelar depois do aceite: `POST /api/match/{id}/cancel`

## Gaps e inconsistencias atuais

### 1. Nem toda regra do service esta exposta como rota

Existem regras e metodos internos que ainda nao aparecem no contrato HTTP, por exemplo:

- `appointment.update(...)`
- `appointment.cancel(...)`
- `appointment.listOpen()`

### 2. `DELETE /api/appointment` segue sem protecao

Hoje o `POST /api/appointment` esta protegido, mas:

- `GET /api/appointment`
- `GET /api/appointment/{id}`
- `DELETE /api/appointment/{id}`

seguem sem `@Security`.

### 3. `appointment-request` e `match` ainda estao publicos

Atualmente estes recursos nao exigem autenticacao no controller:

- todo o recurso `appointment-request`
- todo o recurso `match`

Isso pode mudar no futuro.

### 4. Ainda existem pequenos desalinhamentos no `shared`

Exemplos:

- `createAt` nos tipos, mas `createdAt` no mundo real
- `specialitie` em `IAppointmentRequest`
- alguns relacionamentos opcionais existem no tipo, mas nem sempre sao carregados no service
- `appointment.create` e usada no controller, mas nao esta listada em `shared/src/permissions.ts`

### 5. Password reset ainda nao existe como feature completa

`PASSWORD_RESET_TOKEN_EXPIRATION_MINUTES` existe na config, mas o backend atual nao expoe um fluxo HTTP completo de reset de senha.

### 6. Notificacao real ainda nao existe

Hoje a notificacao e apenas:

- `console.log`

Nao ha push, email, websocket ou inbox HTTP.

### 7. Migrations formais ainda nao existem

O backend depende de:

```ts
sequelize.sync({ alter: true })
```

Isso acelera o desenvolvimento, mas exige cuidado em ambientes compartilhados ou de producao.

## Testes

Comando:

```bash
npm -w backend test
```

Observacoes:

- os testes sobem a app em `localhost:32145`
- esperam um PostgreSQL acessivel em `localhost:5432`
- usam credenciais `postgres / 12345678`
- criam um database temporario com nome `test_viva_<timestamp>`

Se voce usa Docker em uma porta diferente, os testes atuais nao acompanham isso automaticamente; seria preciso ajustar `backend/test/setup.ts`.

## Recomendacoes para frontend

- trate datas como string na camada HTTP
- hidrate sessao com `GET /api/user/me`
- trate `409` como regra de negocio, nao como erro generico
- espere mudancas assincronas de status em `appointment`, `appointment-request` e `appointment_match`
- nao assuma que relacoes opcionais sempre virao carregadas
- nao assuma que rotas hoje publicas continuarao publicas
- para o fluxo de paciente, considere que ainda falta uma estrategia de descoberta de novos matches

## Resumo

O backend atual ja esta funcional para:

- autenticacao
- CRUD de usuarios
- CRUD de especialidades
- CRUD de medicos
- CRUD de pacientes
- criacao e leitura de vagas
- criacao e leitura de requests de fila
- processamento automatico de match
- notificacao via console

Os principais pontos ainda abertos sao:

- protecao consistente de todas as rotas de negocio
- alinhamento entre permissions do controller e permissions declaradas em `shared`
- endpoints adicionais para jornada do paciente
- notificacao real
- migracoes formais
- alinhamento fino dos tipos de `shared`
