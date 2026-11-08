# API REST de Usuários e Produtos — Node.js + HTML

Aplicação web completa para cadastro de usuários, autenticação com JWT e CRUD de produtos, em que **cada usuário só enxerga e altera os próprios produtos**.

- **Backend:** Node.js, Express, MySQL, Sequelize, JWT, Bcrypt, Dotenv
- **Frontend:** HTML5, CSS3 e JavaScript puro (sem frameworks), responsivo

---

## 1. Estrutura de pastas

```
api-usuarios-produtos/
├── README.md
├── backend/
│   ├── .env.example            # modelo das variáveis de ambiente
│   ├── .sequelizerc            # caminhos usados pelo sequelize-cli
│   ├── package.json
│   └── src/
│       ├── server.js           # inicialização: conecta no banco e sobe o servidor
│       ├── app.js              # configuração do Express (middlewares, rotas, estáticos)
│       ├── config/
│       │   └── database.js     # configuração do Sequelize/MySQL (app + migrations)
│       ├── database/
│       │   └── migrations/
│       │       ├── 20261101000001-create-users.js
│       │       └── 20261101000002-create-products.js
│       ├── models/
│       │   ├── index.js        # instancia o Sequelize e registra os relacionamentos
│       │   ├── User.js         # hasMany(Product)
│       │   └── Product.js      # belongsTo(User)
│       ├── routes/
│       │   ├── index.js
│       │   ├── auth.routes.js
│       │   └── product.routes.js
│       ├── controllers/
│       │   ├── auth.controller.js
│       │   └── product.controller.js
│       ├── services/
│       │   ├── auth.service.js     # cadastro, login, bcrypt, geração do JWT
│       │   └── product.service.js  # CRUD com verificação de propriedade
│       ├── middlewares/
│       │   ├── auth.middleware.js      # valida o JWT e define req.userId
│       │   ├── validate.middleware.js  # validação de campos e de :id
│       │   └── error.middleware.js     # 404 e tratamento centralizado de erros
│       └── utils/
│           ├── AppError.js
│           └── asyncHandler.js
└── frontend/
    ├── index.html          # login
    ├── register.html       # cadastro
    ├── dashboard.html      # painel com a lista de produtos
    ├── product-form.html   # criar / editar produto
    ├── css/
    │   └── style.css
    └── js/
        ├── api.js          # cliente HTTP, sessão (token) e helpers de interface
        ├── auth.js         # lógica de login e cadastro
        ├── dashboard.js    # listagem, exclusão e logout
        └── product-form.js # criação e edição
```

### Responsabilidade de cada camada

| Camada | O que faz | O que **não** faz |
|---|---|---|
| `routes` | Liga método + URL aos middlewares e ao controller | Lógica de negócio |
| `middlewares` | Autenticação JWT, validação de entrada, tratamento de erros | Acessar regras de produto |
| `controllers` | Lê `req`, chama o service, monta o status HTTP e a resposta | Consultar o banco diretamente |
| `services` | Regras de negócio: e-mail duplicado, hash de senha, propriedade do produto | Conhecer `req`/`res` |
| `models` | Estrutura das tabelas e relacionamentos | Regras de negócio |
| `config` / `database` | Conexão com o MySQL e migrations | — |

---

## 2. Banco de dados

### Tabelas

**users**

| Coluna | Tipo | Restrições |
|---|---|---|
| id | INT | PK, auto incremento |
| name | VARCHAR(120) | NOT NULL |
| email | VARCHAR(160) | NOT NULL, UNIQUE |
| password | VARCHAR(255) | NOT NULL (hash bcrypt) |
| created_at | DATETIME | NOT NULL |
| updated_at | DATETIME | NOT NULL |

**products**

| Coluna | Tipo | Restrições |
|---|---|---|
| id | INT | PK, auto incremento |
| name | VARCHAR(120) | NOT NULL |
| category | VARCHAR(80) | NOT NULL |
| user_id | INT | NOT NULL, FK → users.id (ON DELETE CASCADE), indexado |
| created_at | DATETIME | NOT NULL |
| updated_at | DATETIME | NOT NULL |

### Relacionamento

```
users (1) ────────< (N) products
```

- `User.hasMany(Product, { foreignKey: 'user_id', as: 'products' })` — **One-to-Many**
- `Product.belongsTo(User, { foreignKey: 'user_id', as: 'owner' })` — **Many-to-One**

---

## 3. Instalação e execução

### Pré-requisitos

- Node.js 18 ou superior
- MySQL 8 (ou MariaDB 10.5+) rodando localmente

### Passo a passo

```bash
# 1. Entrar na pasta do backend
cd api-usuarios-produtos/backend

# 2. Instalar as dependências
npm install

# 3. Criar o arquivo .env a partir do modelo
cp .env.example .env        # no Windows: copy .env.example .env
```

Edite o `.env` com o usuário e a senha do seu MySQL e defina um `JWT_SECRET` longo e aleatório. Para gerar um:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

```bash
# 4. Criar o banco de dados (usa DB_NAME do .env)
npm run db:create

# 5. Criar as tabelas
npm run db:migrate

# 6. Iniciar o servidor
npm start          # ou: npm run dev (reinicia ao salvar arquivos)
```

Acesse **http://localhost:3000** — o próprio Express serve o frontend, então API e site rodam juntos, sem configuração de CORS.

> Se preferir abrir o frontend com o Live Server do VS Code (porta 5500), ele já está configurado para chamar a API em `http://localhost:3000/api`.

### Scripts disponíveis

| Comando | Ação |
|---|---|
| `npm start` | Inicia o servidor |
| `npm run dev` | Inicia com recarregamento automático |
| `npm run db:create` | Cria o banco definido em `DB_NAME` |
| `npm run db:migrate` | Executa as migrations |
| `npm run db:migrate:undo` | Desfaz todas as migrations |

---

## 4. Segurança implementada

| Requisito | Onde |
|---|---|
| Senhas com bcrypt (salt configurável) | `services/auth.service.js` |
| Senha nunca retornada | `defaultScope` exclui `password` + `toJSON()` remove o campo (`models/User.js`) |
| Middleware JWT (`Authorization: Bearer`) | `middlewares/auth.middleware.js` |
| `user_id` vem só do token | `req.userId` definido no middleware; o `validate` descarta campos não previstos, então um `user_id` enviado no body é ignorado |
| Verificação de propriedade | toda busca filtra por `id` **e** `user_id` (`services/product.service.js`) |
| Produto de outro usuário → 404 | não revela se o ID existe |
| Login com mensagem genérica | "E-mail ou senha inválidos." para ambos os casos |
| Validação de campos e e-mail | `middlewares/validate.middleware.js` (e também no frontend) |
| E-mail duplicado | checado no service + `UNIQUE` no banco |
| Erros padronizados | `middlewares/error.middleware.js` — sempre `{ "error": "...", "details"?: {...} }` |
| XSS no frontend | dados do usuário passam por `escapeHtml()` antes de entrar no HTML |

---

## 5. Endpoints

Base URL: `http://localhost:3000/api`

| Método | Rota | Autenticação | Descrição |
|---|---|---|---|
| POST | `/auth/register` | — | Cadastrar usuário |
| POST | `/auth/login` | — | Login, retorna o token |
| GET | `/auth/me` | JWT | Dados do usuário autenticado |
| POST | `/products` | JWT | Criar produto |
| GET | `/products` | JWT | Listar produtos do usuário |
| GET | `/products/:id` | JWT | Buscar produto |
| PUT | `/products/:id` | JWT | Atualizar produto |
| DELETE | `/products/:id` | JWT | Excluir produto |

### Códigos de status

| Código | Quando |
|---|---|
| 200 | Sucesso |
| 201 | Recurso criado |
| 400 | ID inválido ou JSON malformado |
| 401 | Token ausente, inválido ou expirado; login incorreto |
| 404 | Produto não encontrado (ou pertence a outro usuário) |
| 409 | E-mail já cadastrado |
| 422 | Falha de validação dos campos |
| 500 | Erro interno |

---

## 6. Exemplos de requisições e respostas

> Respostas reais capturadas durante os testes.

### Cadastrar usuário

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Maria Souza","email":"maria@email.com","password":"abcdef"}'
```

`201 Created`
```json
{
  "message": "Usuário cadastrado com sucesso.",
  "user": {
    "id": 2,
    "name": "Maria Souza",
    "email": "maria@email.com",
    "updated_at": "2026-11-02T05:02:02.327Z",
    "created_at": "2026-11-02T05:02:02.327Z"
  }
}
```

`409 Conflict` — e-mail repetido
```json
{ "error": "E-mail já cadastrado." }
```

`422 Unprocessable Entity` — dados inválidos
```json
{
  "error": "Dados inválidos.",
  "details": {
    "name": "Nome deve ter pelo menos 3 caracteres.",
    "email": "Formato de e-mail inválido.",
    "password": "Senha deve ter pelo menos 6 caracteres."
  }
}
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"maria@email.com","password":"abcdef"}'
```

`200 OK`
```json
{
  "message": "Login realizado com sucesso.",
  "user": { "id": 2, "name": "Maria Souza", "email": "maria@email.com", "created_at": "...", "updated_at": "..." },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

`401 Unauthorized`
```json
{ "error": "E-mail ou senha inválidos." }
```

Nas próximas requisições, envie o token no header:

```
Authorization: Bearer <token>
```

### Usuário autenticado

```bash
curl http://localhost:3000/api/auth/me -H "Authorization: Bearer $TOKEN"
```

`200 OK`
```json
{ "user": { "id": 2, "name": "Maria Souza", "email": "maria@email.com", "created_at": "...", "updated_at": "..." } }
```

### Criar produto

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Notebook","category":"Eletrônicos"}'
```

`201 Created`
```json
{
  "message": "Produto cadastrado com sucesso.",
  "product": {
    "id": 3,
    "name": "Notebook",
    "category": "Eletrônicos",
    "user_id": 2,
    "updated_at": "2026-11-02T05:02:02.432Z",
    "created_at": "2026-11-02T05:02:02.432Z"
  }
}
```

> Se o body incluir `"user_id": 999`, o campo é descartado: o produto é sempre gravado com o `user_id` do token.

### Listar produtos

```bash
curl http://localhost:3000/api/products -H "Authorization: Bearer $TOKEN"
```

`200 OK`
```json
{
  "total": 1,
  "products": [
    { "id": 3, "name": "Notebook", "category": "Eletrônicos", "user_id": 2, "created_at": "...", "updated_at": "..." }
  ]
}
```

### Buscar produto

```bash
curl http://localhost:3000/api/products/3 -H "Authorization: Bearer $TOKEN"
```

`200 OK`
```json
{ "product": { "id": 3, "name": "Notebook", "category": "Eletrônicos", "user_id": 2, "created_at": "...", "updated_at": "..." } }
```

`404 Not Found` — inexistente ou de outro usuário
```json
{ "error": "Produto não encontrado." }
```

### Atualizar produto

```bash
curl -X PUT http://localhost:3000/api/products/3 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Notebook Dell","category":"Informática"}'
```

`200 OK`
```json
{
  "message": "Produto atualizado com sucesso.",
  "product": { "id": 3, "name": "Notebook Dell", "category": "Informática", "user_id": 2, "created_at": "...", "updated_at": "..." }
}
```

### Excluir produto

```bash
curl -X DELETE http://localhost:3000/api/products/3 -H "Authorization: Bearer $TOKEN"
```

`200 OK`
```json
{ "message": "Produto excluído com sucesso." }
```

### Erros de autenticação

Sem token → `401`
```json
{ "error": "Token não fornecido." }
```

Token adulterado → `401`
```json
{ "error": "Token inválido." }
```

ID não numérico (`/products/abc`) → `400`
```json
{ "error": "ID inválido." }
```

---

## 7. Fluxo na interface

1. **Cadastro** (`register.html`) → validação no navegador e na API → redireciona ao login com mensagem de sucesso.
2. **Login** (`index.html`) → o token e o nome ficam no `localStorage`.
3. **Painel** (`dashboard.html`) → mostra o nome do usuário (confirmado via `/auth/me`) e a tabela de produtos; no celular a tabela vira lista de cartões.
4. **Novo / Editar** (`product-form.html` e `product-form.html?id=N`) → salva e volta ao painel com mensagem.
5. **Excluir** → confirmação antes de apagar.
6. **Sair** → limpa a sessão. Se o token expirar, qualquer chamada retorna 401 e o usuário é levado ao login.

---

## 8. Autores

| Autor | Contribuição |
|---|---|
| [João Vitor](https://github.com/joaoVelosoT) | Back-end e front-end |
| [Carlos Eduardo](https://github.com/dudumimimax-code) | Integração com o banco de dados e criptografia |
