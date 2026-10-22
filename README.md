# FinEXP — Gestão financeira pessoal e compartilhada

Aplicação web para controlar receitas e despesas e **compartilhar carteiras** com outras pessoas, cada uma com um papel (dono, editor ou visualizador). Projeto da disciplina de Programação para Web.

- **Frontend:** React 19 + Vite + Tailwind CSS, Recharts para os gráficos.
- **Backend:** Spring Boot, Spring Security com JWT, Spring Data JPA/Hibernate, MySQL, Swagger (springdoc).

> **Deploy:** _link a ser adicionado quando o sistema for publicado._

## Funcionalidades

| Área | O que existe hoje |
|---|---|
| Autenticação | Cadastro com verificação por e-mail, login (JWT de 24 h), recuperação e alteração de senha |
| Carteiras | Criar, editar e excluir; saldo atualizado a cada lançamento; papel do usuário em cada carteira |
| Compartilhamento | Convidar por e-mail, trocar o papel e remover membros (somente o dono) |
| Transações | Criar, editar e excluir; filtros por tipo, categoria e período; paginação |
| Categorias | Privadas de cada usuário; categorias padrão criadas no cadastro; cor e ícone |
| Dashboard | Saldo, receitas e despesas do mês, gráfico dos últimos 6 meses e lançamentos recentes |

### Papéis em uma carteira

| Ação | Dono | Editor | Visualizador |
|---|:-:|:-:|:-:|
| Ver carteira e transações | ✅ | ✅ | ✅ |
| Criar, editar e excluir transações | ✅ | ✅ | ❌ |
| Editar ou excluir a carteira | ✅ | ❌ | ❌ |
| Convidar, alterar papel e remover membros | ✅ | ❌ | ❌ |

As regras são verificadas **no service**, não apenas na controller.

## Arquitetura

```
saas-financeiro/
├── backend/    API REST (Spring Boot)
│   └── src/main/java/com/saasfinanceiro/finexp/
│       ├── controller/   recebe a requisição e delega ao service
│       ├── service/      regras de negócio e autorização por papel
│       ├── repository/   Spring Data JPA
│       ├── model/        entidades JPA (User, Wallet, WalletMember, Transaction, Category, ...)
│       ├── dto/          objetos de entrada e saída (a API nunca devolve entidades)
│       ├── security/     filtro JWT e configuração do Spring Security
│       ├── exceptions/   exceções de negócio e @RestControllerAdvice
│       └── config/       Swagger
└── frontend/   SPA React
    ├── services/         chamadas à API (axios)
    └── src/
        ├── pages/        telas (auth/ e api/)
        ├── components/   componentes reutilizáveis (Input, Modal, AppLayout, ...)
        └── utils/        validações, formatação, regras de senha
```

## Como executar

### Pré-requisitos

- Java 17 ou superior
- Node.js 20.19 ou superior
- MySQL 8 em execução (o banco `finexp` é criado automaticamente se o usuário tiver permissão)
- Uma conta SMTP para o envio de e-mails (por exemplo, Gmail com _senha de app_)

### 1. Backend

```bash
cd backend
cp src/main/resources/application-secrets-example.properties src/main/resources/application-secrets.properties
# edite o arquivo copiado (veja a tabela de variáveis abaixo)
./mvnw spring-boot:run
```

A API sobe em `http://localhost:8080`. O arquivo `application-secrets.properties` está no `.gitignore` e **nunca deve ser commitado**.

### 2. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

A aplicação abre em `http://localhost:5173`.

### Variáveis de ambiente

Cada valor pode vir do arquivo `application-secrets.properties` ou de uma variável de ambiente equivalente (útil em deploy, onde o arquivo não existe).

| Variável (ambiente) | Propriedade | Descrição | Padrão |
|---|---|---|---|
| `DB_URL` | `spring.datasource.url` | URL JDBC do MySQL | `jdbc:mysql://localhost:3306/finexp?createDatabaseIfNotExist=true&serverTimezone=UTC` |
| `DB_USERNAME` | `spring.datasource.username` | Usuário do banco | `root` |
| `DB_PASSWORD` | `spring.datasource.password` | Senha do banco | vazio |
| `JWT_SECRET` | `jwt.secret` | Chave de assinatura do JWT, **mínimo de 32 caracteres** (a aplicação não sobe sem ela) | — |
| `JWT_EXPIRATION` | `jwt.expiration` | Validade do token em milissegundos | `86400000` (24 h) |
| `SPRING_MAIL_USERNAME` | `spring.mail.username` | Usuário SMTP | — |
| `SPRING_MAIL_PASSWORD` | `spring.mail.password` | Senha SMTP (senha de app) | — |
| `APP_FRONTEND_URL` | `app.frontend-url` | URL pública do frontend, usada nos links dos e-mails | `http://localhost:5173` |
| `APP_CORS_ALLOWED_ORIGINS` | `app.cors.allowed-origins` | Origens permitidas no CORS, separadas por vírgula | `http://localhost:5173,http://localhost:3000` |
| `APP_DEBUG_RESET_TOKEN` | `app.debug-reset-token` | **Somente testes**: devolve o token de redefinição de senha na resposta | `false` |
| `VITE_API_BASE_URL` | (frontend, `.env`) | URL da API vista pelo navegador | `http://localhost:8080` |

### Documentação da API

Com o backend rodando: **http://localhost:8080/swagger-ui.html** (OpenAPI em `/v3/api-docs`). Use o botão _Authorize_ com o `accessToken` devolvido por `POST /auth/login`.

`GET /actuator/health` responde sem autenticação (verificação de saúde).

### Testando a API manualmente

[`backend/smoke-tests.http`](backend/smoke-tests.http) é um roteiro para a extensão _REST Client_ do VS Code. Ele cobre cadastro, login, recuperação de senha, categorias, carteiras, saldo, filtros e autorização entre usuários, com o resultado esperado em cada passo.

## API em resumo

Rotas de autenticação em `/auth/*` e demais recursos em `/api/v1/*`. Todas, exceto as de autenticação e `/actuator/health`, exigem `Authorization: Bearer <accessToken>`.

| Recurso | Rotas |
|---|---|
| Auth | `POST /auth/register`, `/auth/verify-account`, `/auth/login`, `/auth/forgot-password`, `/auth/reset-password` |
| Usuário | `GET` e `PUT /api/v1/users/me`, `PATCH /api/v1/users/me/password` |
| Categorias | `GET`, `POST /api/v1/categories`; `PUT`, `DELETE /api/v1/categories/{id}` |
| Carteiras | `GET`, `POST /api/v1/wallets`; `GET`, `PUT`, `DELETE /api/v1/wallets/{id}` |
| Membros | `GET`, `POST /api/v1/wallets/{id}/members`; `PATCH`, `DELETE .../members/{userId}` |
| Transações | `GET`, `POST /api/v1/wallets/{id}/transactions`; `GET`, `PUT`, `DELETE .../transactions/{transactionId}` |
| Resumo | `GET /api/v1/wallets/{id}/summary?startDate=&endDate=` |

Os erros seguem sempre o formato `{ timestamp, status, error, message }`: 400 (validação), 401 (sem autenticação), 403 (sem permissão), 404, 409 (conflito), 422 (regra de negócio).

## Decisões de projeto

- **JWT sem sessão no servidor.** O token leva o id do usuário (`sub`), o e-mail e `iat`/`exp`. Biblioteca `java-jwt` (Auth0), escolhida no lugar de `jjwt` por já atender ao payload exigido.
- **Spring Boot 4.0.6**, a versão mais recente na criação do projeto (a especificação cita a série 3.x).
- **Saldo da carteira atômico.** Cada lançamento altera o saldo com um `UPDATE ... SET balance = balance + :delta` no banco, evitando perda de atualização quando dois membros lançam ao mesmo tempo.
- **Categorias privadas.** Cada usuário só vê e usa as próprias categorias. Numa carteira compartilhada, a transação de outro membro mantém a categoria dele ao ser editada.
- **Segurança.** Senhas com BCrypt; login sem enumeração de contas (mesma mensagem e tempo de resposta parecido para e-mail inexistente e senha errada); segredos fora do repositório; CORS restrito; erros internos nunca expõem detalhes de SQL.
- **Token de redefinição de senha.** Só vai por e-mail. A resposta de `forgot-password` o inclui apenas se `app.debug-reset-token=true`, para testes sem e-mail real.
- **Validação nos dois lados.** O frontend valida antes de enviar (e-mail, tamanho e força da senha, valores), e o backend repete as regras com Bean Validation.

## Próximos passos

Itens ainda planejados para a entrega final: relatórios, atualização em tempo real (SSE), integração com IA, PWA, limite de requisições (rate limiting) e cabeçalhos de segurança, testes automatizados e deploy.
