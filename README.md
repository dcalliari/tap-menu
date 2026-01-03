# Tap Menu

Tap Menu é uma proposta de cardápio digital com pedidos via QR Code para bares e restaurantes.

A ideia é simples: cada mesa tem um QR Code; o cliente abre o link no celular, navega pelo cardápio, monta o pedido e acompanha o status. Do outro lado, o estabelecimento administra categorias/itens e acompanha os pedidos por mesa.

## Stack

- Runtime/monorepo: Bun + Turbo
- API: Hono
- Web: Vite + React
- Router/Data fetching: TanStack Router + TanStack Query
- UI/estilos: Tailwind + Shadcn/ui
- Banco: PostgreSQL + Drizzle ORM
- Cache/infra: Redis

## Estrutura do projeto

```
.
├── client/               # Frontend (React)
├── server/               # Backend (Hono)
├── shared/               # Tipos/contratos compartilhados
├── package.json          # Scripts raiz (turbo)
└── turbo.json            # Orquestração de build/dev
```

## Rodando localmente

### Pré-requisitos

- Bun
- PostgreSQL
- Redis

### Instalação

Na raiz do monorepo:

```bash
bun install
```

### Variáveis de ambiente

- Backend: há um exemplo em [server/src/.env.example](server/src/.env.example)
  - Recomenda-se criar `server/.env` com o mesmo conteúdo (ou exportar as variáveis no seu shell/CI).
- Frontend:
  - opcionalmente defina `VITE_SERVER_URL` (padrão: `http://localhost:3000`)

### Desenvolvimento

Subir tudo (client + server):

```bash
bun run dev
```

Ou individualmente:

```bash
bun run dev:client
bun run dev:server
```

URLs úteis:

- Client: `http://localhost:5173`
- Server: `http://localhost:3000`
- Health: `http://localhost:3000/health`

## Scripts

- `bun run dev` / `bun run dev:client` / `bun run dev:server`
- `bun run build` / `bun run build:client` / `bun run build:server`
- `bun run lint` (Biome)
- `bun run type-check`
- `bun run format`

## Licença

MIT (ver [LICENSE](LICENSE)).
