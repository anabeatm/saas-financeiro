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
| `npm run preview` | Serve o build localmente (é onde o service worker do PWA funciona; no `npm run dev` ele fica desligado) |
| `npm run lint` | ESLint |

O backend precisa estar no ar (`VITE_API_BASE_URL`). O CORS do backend aceita `http://localhost:5173` por padrão.

## Rotas

| Rota | Tela | Acesso |
|---|---|---|
| `/login`, `/register`, `/recover` | Entrar, cadastro, pedir recuperação | Público (usuário logado vai ao dashboard) |
| `/verify-account/:token` | Confirmação de e-mail | Público |
| `/forgot-password/:token` | Definir nova senha (também em `/redefinir-senha/:token`) | Público |
| `/app/dashboard` | Resumo financeiro, progresso (nível, XP, ofensiva, check-in) e orçamentos do mês | Autenticado |
| `/app/transactions` | Transações, filtros e paginação | Autenticado |
| `/app/categories` | Categorias e orçamento mensal de cada categoria de despesa | Autenticado |
| `/app/wallets` | Carteiras e membros | Autenticado |
| `/app/reports` | Extrato por período, CSV e impressão/PDF | Autenticado |
| `/app/progress` | Nível, ofensiva, conquistas, XP recente e regras da gamificação | Autenticado |
| `/app/profile` | Configurações de perfil: nome, foto e senha (também em `/app/perfil`) | Autenticado |
| `/app/profile/password` | Mesma tela, aberta na seção de senha (também em `/app/perfil/senha`) | Autenticado |

`/recuperar-senha` redireciona para `/recover`. As rotas em português existem por serem as citadas no enunciado da atividade.

## Estrutura

```
services/        uma classe por recurso da API (axios)
configs/         instância do axios (token no header, tratamento de 401)
src/
├── pages/       telas: auth/ (públicas) e api/ (área logada)
├── components/  Input, Button, Modal, ConfirmDialog, AppLayout, PasswordStrength, ...
│   ├── wallets/ · transactions/ · categories/   modais de cada recurso
├── realtime/    conexão SSE, provider, useWalletEvents, indicador "Live" e textos das notificações
├── pwa/         service worker, registro, botão "Install app" e aviso de offline
├── components/reports/AiInsightsCard.jsx   card de insights por IA nos relatórios
├── components/gamification/   sprites em pixel art (PixelSprite + sprites.js), cards de progresso e de orçamentos, modal de orçamento, textos e regras
└── utils/       validators, password (regras de senha), format, errors, selectedWallet
```

## Decisões

- **Sessão:** o `accessToken` fica no `localStorage`; o `ProtectedRoute` barra quem não tem token e o interceptor do axios leva ao login quando a API responde 401.
- **Validação de formulários:** regras em `utils/` e mensagens por campo (`Input` aceita `error`). A mesma regra de senha vale no cadastro, na redefinição e na alteração: 8 a 100 caracteres e força mínima "Medium".
- **Erros da API:** o interceptor devolve a `message` do backend como texto, que as telas mostram em toast ou no campo correspondente.
- **Layout da área logada:** `AppLayout` entrega menu lateral no desktop e barra superior + navegação inferior no celular; as páginas entram por `<Outlet />`.
- **Pixel art sem arquivos de imagem:** cada sprite é uma grade de caracteres com uma paleta, desenhada pelo `PixelSprite` como quadrados SVG (`shapeRendering="crispEdges"`). A moeda do nível é gerada por código, com o número escrito em dígitos de 3x5 pixels, e sua cor muda com o título. Assim não há imagens nem fontes externas, que a CSP do site bloquearia. Os ícones de interface continuam sendo do `lucide-react`.
- **Notificações de progresso:** os eventos `gamification-event` do SSE viram toasts (XP, nível, conquista, alerta de orçamento), e os cards se recarregam sozinhos (`useGamificationEvents`).
- **Carteira selecionada:** lembrada no `localStorage` e compartilhada entre dashboard e transações.
