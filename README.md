# VivaUnimed - Monorepo

Este repositório contém a aplicação VivaUnimed organizada como um monorepo com três áreas principais:
---

### Fluxo:  
  Http => Controller => Service => Model => PostgreSQL

---

### Estrutura de pastas
- `backend/`: código do servidor Node.js
    - `api`: controladores de roteamento de chamadas http 
    - `db/models`: modelos de tabelas do banco de dados
    - `service`: regras de negócio
- `frontend/`:
  - `admin` interface de web com painel administrativo;
  - `client`: inteface web para acesso dos clientes;
- `shared/`: definições de tipos compartilhadas entre o backend e frontend;

---

### Tecnologias
- Node.JS - Backend JavaScript runtime
- Typescript
- TSOA - Roteamento e validação de chamadas HTTP
- PostgreSQL - Banco de Dados
- Sequelize - Mapeamento de objetos e tabelas do banco de dados para JavaScript
- React - Frontend Single Page Application
<!-- - TanStack Router - Roteamento das páginas do frontend de forma dinâmica -->
<!-- - TanStack Query - Gerenciamento cache e chamadas para api no frontend  -->
<!-- - Axios - Chamadas HTTP para o backend  -->
<!-- - Tailwind - Framework de estilização e padronização do CSS; -->
<!-- - Shadcn - Framwork de componentes frontend; -->
- Docker & Docker Compose - Conteinerização da aplicação e ambiente de banco de dados

---

## Como Executar o Projeto

Você pode executar o projeto localmente de duas formas: utilizando o **Docker** (recomendado para rodar tudo rapidamente) ou de forma **Nativa/Local** (ideal para desenvolvimento).

### Pré-requisitos
Antes de começar, certifique-se de ter instalado:
* [Git](https://git-scm.com/)
* [Node.js](https://nodejs.org/) (versão LTS)
* [Docker](https://www.docker.com/)

---

### Opção 1: Executando com Docker

Esta opção levanta o Banco de Dados, o Backend e os frontends de forma isolada e configurada.

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/VivaUnimed/viva-unimed/tree/feat/docker-build
   cd viva-unimed
   ```

2. **Use o compose local para desenvolvimento:**
   ```bash
   docker-compose -f docker-compose.local.yaml up -d
   ```

3. **Quando for necessário rebuildar as imagens:**
   ```bash
   docker-compose -f docker-compose.local.yaml up -d --build
   ```

4. **Verifique os containers:**
   ```bash
   docker-compose -f docker-compose.local.yaml ps
   ```

5. **Parar os containers:**
   ```bash
   docker-compose -f docker-compose.local.yaml down
   ```

>OBS: Para rodar em outra máquina com o banco local, não é necessário criar `.env` se você usar `docker-compose.local.yaml`. Ele já define os valores do PostgreSQL local.

---

#### Quando criar `.env`

Se você estiver rodando o backend fora do Docker ou usando um banco de dados externo, crie um arquivo `.env` na raiz do projeto, usando de exemplo o arquivo `.env.example`.

1. Copie o exemplo:
   ```bash
   cp .env.example .env
   ```

2. Ajuste os valores:
   - `DB_ADDRESS`: host do banco de dados
   - `DB_PORT`: porta do banco (ex.: `5432`)
   - `DB_DATABASE`: nome do banco
   - `DB_USERNAME`: usuário do banco
   - `DB_PASSWORD`: senha do banco
   - `JWT_SECRET`: segredo para tokens JWT
   - `DEFAULT_ADMIN_EMAIL`: para criar um primeiro usuário admin, caso ainda não tenha
   - `DEFAULT_ADMIN_PASSWORD`: senha do usuário

3. **Use o compose para conexão com banco real:**
   ```bash
   docker-compose -f docker-compose.yaml up -d
   ```

---

### Opção 2: Executando sem Docker

Use esta opção apenas se quiser executar cada serviço localmente no seu ambiente:

1. Instale as dependências na raiz do monorepo e nos workspaces:
   ```bash
   npm install
   npm install --workspace backend
   npm install --workspace frontend/admin
   npm install --workspace frontend/client
   ```

2. Inicie o backend:
   ```bash
   npm run backend
   ```

3. Inicie o frontend administrativo:
   ```bash
   npm run admin
   ```

4. Inicie o frontend cliente:
   ```bash
   npm run client
   ```

