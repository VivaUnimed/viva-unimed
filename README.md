# VivaUnimed - Monorepo

Este repositório contém a aplicação VivaUnimed organizada como um monorepo com três áreas principais:

### Fluxo:  
  Http => Controller => Service => Model => PostgreSQL

### Estrutura de pastas
- `backend/`: código do servidor Node.js
    - `api`: controladores de roteamento de chamadas http 
    - `db/models`: modelos de tabelas do banco de dados
    - `service`: regras de negócio
- `frontend/`:
  - `admin` interface de web com painel administrativo;
  - `client`: inteface web para acesso dos clientes;
- `shared/`: definições de tipos compartilhadas entre o backend e frontend;

### Tecnologias
- Node.JS - Backend JavaScript runtime
- Typescript
- TSOA - Roteamento e validação de chamadas HTTP
- PostgreSQL - Banco de Dados
- Sequelize - Mapeamento de objetos e tabelas do banco de dados para JavaScript
- React - Frontend Single Page Application
- TanStack Router - Roteamento das páginas do frontend de forma dinâmica
- TanStack Query - Gerenciamento cache e chamadas para api no frontend
- Axios - Chamadas HTTP para o backend
- Tailwind - Framework de estilização e padronização do CSS;
- Shadcn - Framwork de componentes frontend;
