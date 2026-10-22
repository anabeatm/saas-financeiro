# FinEXP — Backend

API REST em **Spring Boot** (Java 17), com Spring Security + JWT, Spring Data JPA/Hibernate e MySQL.
A visão geral do projeto, as variáveis de ambiente e as decisões de projeto estão no [README da raiz](../README.md).

## Executar

```bash
cp src/main/resources/application-secrets-example.properties src/main/resources/application-secrets.properties
# preencha: spring.datasource.password, spring.mail.password, jwt.secret (>= 32 caracteres)
./mvnw spring-boot:run
```

- API: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html
- Health check: http://localhost:8080/actuator/health

O banco `finexp` é criado automaticamente (`createDatabaseIfNotExist=true`) e as tabelas são geradas pelo Hibernate (`ddl-auto=update`).

## Testar

- Testes automatizados: `./mvnw test` (por enquanto só verifica se o contexto da aplicação sobe; os testes de integração ainda serão escritos)
- Roteiro manual de ponta a ponta: [`smoke-tests.http`](smoke-tests.http) (extensão _REST Client_ do VS Code). Cada passo traz o resultado esperado.

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
