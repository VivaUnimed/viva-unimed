# Viva Unimed — Backend

Descrição curta
- Backend da aplicação Viva Unimed: API RESTful em Node.js + TypeScript.
- Usa Express, TSOA (rotas e documentação), Sequelize + PostgreSQL para persistência, e Swagger para documentação.

O que é
- Fornece endpoints para gerenciamento de pacientes, profissionais, agendamentos, autenticação e integrações internas.
- Projetado para rodar localmente e em produção com configuração via variáveis de ambiente.

Requisitos
- Node.js
- npm
- PostgreSQL

Instalação rápida
1. Entre na pasta do backend:

   ```bash
   cd backend
   ```

2. Instale dependências:

   ```bash
   npm install
   ```

Configuração de ambiente
- Crie um arquivo `.env` na raiz de `backend` com as variáveis abaixo (exemplo):

```
SERVER_PORT=3000
CORS_ORIGINS=*
DB_ADDRESS=localhost // ou endereço real do banco 
DB_PORT=5432
DB_USERNAME=postgres // ou nome real do banco
DB_DATABASE=nome_banco // nome definido no banco
DB_PASSWORD=sua_senha
//usuário que é criado por padrão 
DEFAULT_ADMIN_EMAILadmin@exemplo.com
DEFAULT_ADMIN_PASSWORD=admin123
APPOINTMENT_JOB_CRON=0/1 * * * 1-5
```

- Observação: as variáveis `DB_*` devem apontar para uma instância PostgreSQL acessível.

Rodando a aplicação
- Rodar:

  ```bash
  npm run backend
  ```

Documentação (Swagger)
- Após iniciar, a API doc fica disponível em: `http://localhost:3000/api/docs` (porta padrão `3000`).
