# FinEXP — Frontend

SPA em **React 19** com Vite, Tailwind CSS 4, React Router 7, axios e Recharts.
A visão geral do projeto e as variáveis de ambiente estão no [README da raiz](../README.md).

## Executar

```bash
cp .env.example .env     # VITE_API_BASE_URL=http://localhost:8080
npm install
npm run dev              # http://localhost:5173
```

| Script | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção em `dist/` |
| `npm run preview` | Serve o build localmente |
| `npm run lint` | ESLint |

O backend precisa estar no ar (`VITE_API_BASE_URL`). O CORS do backend aceita `http://localhost:5173` por padrão.

## Rotas

| Rota | Tela | Acesso |
|---|---|---|
| `/login`, `/register`, `/recover` | Entrar, cadastro, pedir recuperação | Público (usuário logado vai ao dashboard) |
| `/verify-account/:token` | Confirmação de e-mail | Público |
| `/forgot-password/:token` | Definir nova senha (também em `/redefinir-senha/:token`) | Público |
| `/app/dashboard` | Resumo financeiro | Autenticado |
| `/app/transactions` | Transações, filtros e paginação | Autenticado |
| `/app/categories` | Categorias | Autenticado |
| `/app/wallets` | Carteiras e membros | Autenticado |
| `/app/profile/password` | Alterar senha (também em `/app/perfil/senha`) | Autenticado |

`/recuperar-senha` redireciona para `/recover`. As rotas em português existem por serem as citadas no enunciado da atividade.

## Estrutura

```
services/        uma classe por recurso da API (axios)
configs/         instância do axios (token no header, tratamento de 401)
src/
├── pages/       telas: auth/ (públicas) e api/ (área logada)
├── components/  Input, Button, Modal, ConfirmDialog, AppLayout, PasswordStrength, ...
│   ├── wallets/ · transactions/ · categories/   modais de cada recurso
└── utils/       validators, password (regras de senha), format, errors, selectedWallet
```

## Decisões

- **Sessão:** o `accessToken` fica no `localStorage`; o `ProtectedRoute` barra quem não tem token e o interceptor do axios leva ao login quando a API responde 401.
- **Validação de formulários:** regras em `utils/` e mensagens por campo (`Input` aceita `error`). A mesma regra de senha vale no cadastro, na redefinição e na alteração: 8 a 100 caracteres e força mínima "Medium".
- **Erros da API:** o interceptor devolve a `message` do backend como texto, que as telas mostram em toast ou no campo correspondente.
- **Layout da área logada:** `AppLayout` entrega menu lateral no desktop e barra superior + navegação inferior no celular; as páginas entram por `<Outlet />`.
- **Carteira selecionada:** lembrada no `localStorage` e compartilhada entre dashboard e transações.
