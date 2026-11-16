# FinEXP — Gestão financeira pessoal e compartilhada

Aplicação web para controlar receitas e despesas e **compartilhar carteiras** com outras pessoas, cada uma com um papel (dono, editor ou visualizador). Projeto da disciplina de Programação para Web.

- **Frontend:** React 19 + Vite + Tailwind CSS, Recharts para os gráficos.
- **Backend:** Spring Boot, Spring Security com JWT, Spring Data JPA/Hibernate, Swagger (springdoc). Banco MySQL no desenvolvimento e PostgreSQL em produção.

> **Deploy:** _link a ser adicionado quando o sistema for publicado._ Frontend na Vercel, API no Render (Docker) e banco PostgreSQL na Aiven; passo a passo em [`docs/DEPLOY.md`](docs/DEPLOY.md).

## Funcionalidades

| Área | O que existe hoje |
|---|---|
| Autenticação | Cadastro com verificação por e-mail, login (JWT de 24 h), recuperação e alteração de senha |
| Carteiras | Criar, editar e excluir; saldo atualizado a cada lançamento; papel do usuário em cada carteira |
| Compartilhamento | Convidar por e-mail, trocar o papel e remover membros (somente o dono) |
| Transações | Criar, editar e excluir; filtros por tipo, categoria e período; paginação |
| Categorias | Privadas de cada usuário; categorias padrão criadas no cadastro; cor e ícone |
| Dashboard | Saldo, receitas e despesas do mês, gráfico dos últimos 6 meses e lançamentos recentes |
| Relatórios | Extrato da carteira por período: saldo inicial e final, saldo após cada lançamento, totais e participação por categoria; exportação em CSV e impressão/PDF |
| Tempo real | Quando um membro lança, edita ou exclui uma transação, ou altera a carteira e seus membros, as telas dos demais membros se atualizam sozinhas e mostram um aviso (Server-Sent Events) |

### Papéis em uma carteira

| Ação | Dono | Editor | Visualizador |
|---|:-:|:-:|:-:|
| Ver carteira, transações e relatórios | ✅ | ✅ | ✅ |
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
- MySQL 8 em execução (o banco `finexp` é criado automaticamente se o usuário tiver permissão). A aplicação também roda com PostgreSQL, usado em produção: basta trocar o `DB_URL`.
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
| `DB_URL` | `spring.datasource.url` | URL JDBC do banco (MySQL ou PostgreSQL; o driver é escolhido pela URL) | `jdbc:mysql://localhost:3306/finexp?createDatabaseIfNotExist=true&serverTimezone=UTC` |
| `DB_USERNAME` | `spring.datasource.username` | Usuário do banco | `root` |
| `DB_PASSWORD` | `spring.datasource.password` | Senha do banco | vazio |
| `JWT_SECRET` | `jwt.secret` | Chave de assinatura do JWT, **mínimo de 32 caracteres** (a aplicação não sobe sem ela) | — |
| `JWT_EXPIRATION` | `jwt.expiration` | Validade do token em milissegundos | `86400000` (24 h) |
| `DB_POOL_SIZE` | `spring.datasource.hikari.maximum-pool-size` | Conexões simultâneas com o banco | `5` |
| `PORT` | `server.port` | Porta HTTP (definida automaticamente pelo Render) | `8080` |
| `MAIL_USERNAME` | `spring.mail.username` | Usuário SMTP (desenvolvimento, Gmail) | — |
| `SPRING_MAIL_PASSWORD` | `spring.mail.password` | Senha SMTP (senha de app do Gmail) | — |
| `BREVO_API_KEY` | `app.mail.brevo-api-key` | Chave da API do Brevo. Quando definida, os e-mails saem pela API (produção) em vez de SMTP | vazio |
| `MAIL_FROM` | `app.mail.from` | Remetente dos e-mails (precisa estar verificado no Brevo) | o `MAIL_USERNAME` |
| `APP_FRONTEND_URL` | `app.frontend-url` | URL pública do frontend, usada nos links dos e-mails | `http://localhost:5173` |
| `APP_CORS_ALLOWED_ORIGINS` | `app.cors.allowed-origins` | Origens permitidas no CORS, separadas por vírgula | `http://localhost:5173,http://localhost:3000` |
| `APP_DEBUG_RESET_TOKEN` | `app.debug-reset-token` | **Somente testes**: devolve o token de redefinição de senha na resposta | `false` |
| `VITE_API_BASE_URL` | (frontend, `.env`) | URL da API vista pelo navegador | `http://localhost:8080` |

### Documentação da API

Com o backend rodando: **http://localhost:8080/swagger-ui.html** (OpenAPI em `/v3/api-docs`). Use o botão _Authorize_ com o `accessToken` devolvido por `POST /auth/login`.

`GET /actuator/health` responde sem autenticação (verificação de saúde).

## API em resumo

Rotas de autenticação em `/auth/*` e demais recursos em `/api/v1/*`. Todas, exceto as de autenticação e `/actuator/health`, exigem `Authorization: Bearer <accessToken>`.

| Recurso | Rotas |
|---|---|
| Auth | `POST /auth/register`, `/auth/verify-account`, `/auth/login`, `/auth/forgot-password`, `/auth/reset-password` |
| Usuário | `GET` e `PUT /api/v1/users/me`, `PUT` e `DELETE /api/v1/users/me/avatar`, `PATCH /api/v1/users/me/password` |
| Categorias | `GET`, `POST /api/v1/categories`; `PUT`, `DELETE /api/v1/categories/{id}` |
| Carteiras | `GET`, `POST /api/v1/wallets`; `GET`, `PUT`, `DELETE /api/v1/wallets/{id}` |
| Membros | `GET`, `POST /api/v1/wallets/{id}/members`; `PATCH`, `DELETE .../members/{userId}` |
| Transações | `GET`, `POST /api/v1/wallets/{id}/transactions`; `GET`, `PUT`, `DELETE .../transactions/{transactionId}` |
| Resumo | `GET /api/v1/wallets/{id}/summary?startDate=&endDate=` |
| Relatórios | `GET /api/v1/wallets/{id}/reports/statement?startDate=&endDate=` (JSON) e `.../reports/statement/csv` (download) |
| Tempo real | `GET /api/v1/events/stream` (`text/event-stream`): eventos `wallet-event` das carteiras de que o usuário é membro |

Os erros seguem sempre o formato `{ timestamp, status, error, message }`: 400 (validação), 401 (sem autenticação), 403 (sem permissão), 404, 409 (conflito), 422 (regra de negócio).

## Decisões de projeto

- **JWT sem sessão no servidor.** O token leva o id do usuário (`sub`), o e-mail e `iat`/`exp`. Biblioteca `java-jwt` (Auth0), escolhida no lugar de `jjwt` por já atender ao payload exigido.
- **Spring Boot 4.0.6**, a versão mais recente na criação do projeto (a especificação cita a série 3.x).
- **Saldo da carteira atômico.** Cada lançamento altera o saldo com um `UPDATE ... SET balance = balance + :delta` no banco, evitando perda de atualização quando dois membros lançam ao mesmo tempo.
- **Categorias privadas.** Cada usuário só vê e usa as próprias categorias. Numa carteira compartilhada, a transação de outro membro mantém a categoria dele ao ser editada.
- **Segurança.** Senhas com BCrypt; login sem enumeração de contas (mesma mensagem e tempo de resposta parecido para e-mail inexistente e senha errada); segredos fora do repositório; CORS restrito; erros internos nunca expõem detalhes de SQL.
- **Token de redefinição de senha.** Só vai por e-mail. A resposta de `forgot-password` o inclui apenas se `app.debug-reset-token=true`, para testes sem e-mail real.
- **Relatório de extrato.** O saldo inicial é calculado a partir das transações anteriores ao período (não do saldo atual), então o extrato de qualquer período fecha com o saldo daquela data. O período máximo é de um ano, para manter o relatório leve. O CSV traz só a tabela de lançamentos (data, tipo, descrição, categoria, autor, valor e saldo), pronta para planilha; os totais e a divisão por categoria ficam na tela e no PDF. Usa `;` e vírgula decimal (padrão das planilhas no Brasil), tem BOM UTF-8 para acentos e neutraliza textos que começam com `= + - @` (proteção contra _CSV injection_). O PDF é gerado pela impressão do navegador, sem dependência extra no backend.
- **Tempo real com Server-Sent Events.** As atualizações só vão do servidor para o navegador, então SSE basta e é mais simples que WebSocket (HTTP comum, sem protocolo extra). Os services publicam um evento a cada alteração, e ele só é enviado **depois do commit** (`@TransactionalEventListener`), para ninguém ser avisado de algo que foi desfeito. Cada evento vai apenas para os membros da carteira. O navegador lê o stream com `fetch`, mantendo o JWT no cabeçalho `Authorization` (o `EventSource` nativo obrigaria a colocá-lo na URL), e reconecta sozinho: tenta de novo a cada poucos segundos (no máximo 5 s) e na hora em que o usuário volta para a aba ou a internet volta. Um _heartbeat_ a cada 25 s mantém a conexão aberta atrás de proxies como o do Render, e cada usuário pode ter no máximo 5 conexões abertas.
- **Pronto para deploy.** O backend tem um `Dockerfile` (o Render executa Java por Docker), lê toda a configuração de variáveis de ambiente e funciona com MySQL ou PostgreSQL sem mudar código. Como o plano gratuito do Render bloqueia SMTP, em produção os e-mails saem pela API HTTPS do Brevo; localmente continuam pelo Gmail. O _health check_ (`/actuator/health`) não depende do servidor de e-mail.
- **Validação nos dois lados.** O frontend valida antes de enviar (e-mail, tamanho e força da senha, valores), e o backend repete as regras com Bean Validation.

## Próximos passos

Itens ainda planejados para a entrega final: integração com IA, PWA, limite de requisições (rate limiting) e cabeçalhos de segurança, testes automatizados e a publicação (deploy).
