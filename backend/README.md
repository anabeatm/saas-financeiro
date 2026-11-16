# FinEXP — Backend

API REST em **Spring Boot** (Java 17), com Spring Security + JWT e Spring Data JPA/Hibernate. Usa MySQL no desenvolvimento e PostgreSQL em produção (o driver é escolhido pelo `DB_URL`).
A visão geral do projeto, as variáveis de ambiente e as decisões de projeto estão no [README da raiz](../README.md).

## Executar

```bash
cp src/main/resources/application-secrets-example.properties src/main/resources/application-secrets.properties
# preencha: spring.datasource.password, spring.mail.username, spring.mail.password, jwt.secret (>= 32 caracteres)
./mvnw spring-boot:run
```

- API: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html
- Health check: http://localhost:8080/actuator/health

O banco `finexp` é criado automaticamente (`createDatabaseIfNotExist=true`) e as tabelas são geradas pelo Hibernate (`ddl-auto=update`).

### Com Docker (como em produção)

```bash
docker build -t finexp-api .
docker run -p 8080:8080 -e DB_URL=... -e DB_USERNAME=... -e DB_PASSWORD=... -e JWT_SECRET=... finexp-api
```

O passo a passo da publicação (Aiven, Brevo, Render e Vercel) está em [`docs/DEPLOY.md`](../docs/DEPLOY.md).

## Testar

- Testes automatizados: `./mvnw test`. Os testes unitários do relatório (`ReportServiceTest`, `StatementCsvExporterTest`) do tempo real (`WalletEventPublisherTest`, `SseConnectionRegistryTest`) e do envio de e-mail (`EmailServiceTest`) rodam sem banco; o `FinExpApplicationTests` sobe o contexto completo e precisa do MySQL.

Para os passos de recuperação de senha sem e-mail real, ative `app.debug-reset-token=true` no arquivo de segredos.

## Camadas

| Pacote | Responsabilidade |
|---|---|
| `controller` | Recebe a requisição HTTP, valida o corpo (`@Valid`) e delega ao service |
| `service` | Regras de negócio e autorização por papel na carteira |
| `repository` | Interfaces Spring Data JPA (inclui filtros por Specification) |
| `model` | Entidades JPA |
| `dto` | Objetos de entrada e saída; nenhuma entidade é devolvida pela API |
| `security` | `SecurityFilter` (valida o JWT a cada requisição) e `SecurityConfig` |
| `exceptions` | `ResourceNotFoundException`, `BusinessException`, `ConflictException`, `BadRequestException` e o `GlobalExceptionHandler` |
| `config` | Configuração do Swagger |
| `realtime` | Tempo real (SSE): conexões abertas por usuário, publicação dos eventos de carteira e envio após o commit |

## Modelo de dados

`User` 1—N `Wallet` (dono) · `Wallet` N—N `User` via `WalletMember` (papel `OWNER`, `EDITOR` ou `VIEWER`, par carteira+usuário único) · `Wallet` 1—N `Transaction` · `User` 1—N `Category` · `VerificationToken` e `PasswordResetToken` (um por solicitação, com expiração).

## Erros

Toda resposta de erro segue o mesmo formato:

```json
{ "timestamp": "2026-10-22T13:03:43", "status": 404, "error": "Not Found", "message": "Wallet not found" }
```

| Status | Quando |
|---|---|
| 400 | Validação de campos, JSON inválido, parâmetro ausente, token inválido ou expirado |
| 401 | Requisição sem autenticação válida |
| 403 | Autenticado, mas sem permissão (papel insuficiente, carteira de outro usuário) |
| 404 | Recurso inexistente (ou que o usuário não pode ver) |
| 409 | Conflito, como e-mail ou membro já cadastrado |
| 422 | Regra de negócio, como excluir categoria com transações ou senha atual incorreta |
