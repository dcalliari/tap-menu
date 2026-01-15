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

- Backend: há um exemplo em [server/.env.example](server/.env.example)
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

## Production Deployment

### Docker Compose (Recommended)

The easiest way to deploy Tap Menu is using Docker Compose:

1. **Set environment variables:**
   
   Create a `.env` file in the project root or export the required variables:
   
   ```bash
   export JWT_SECRET="your_secure_jwt_secret_at_least_32_characters_long"
   ```

2. **Build and run:**
   
   ```bash
   docker compose -f docker-compose.prod.yml up -d --build
   ```

3. **Run database migrations:**
   
   ```bash
   docker compose -f docker-compose.prod.yml exec server bun run db:migrate
   ```

4. **Access the application:**
   - Frontend: `http://localhost` (port 80)
   - Backend API: `http://localhost:3000`
   - Health check: `http://localhost:3000/health`

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | - | PostgreSQL connection string |
| `REDIS_URL` | Yes | - | Redis connection string |
| `JWT_SECRET` | Yes | - | Secret for JWT signing (min 32 chars) |
| `FRONTEND_URL` | Yes | - | Frontend URL for CORS configuration |
| `NODE_ENV` | No | `development` | Environment (`development`, `production`, `test`) |
| `PORT` | No | `3000` | Server port |

### Manual Deployment

1. **Build the project:**
   
   ```bash
   bun install
   bun run build
   ```

2. **Run database migrations:**
   
   ```bash
   cd server && bun run db:migrate
   ```

3. **Start the server:**
   
   ```bash
   NODE_ENV=production bun run server/dist/index.js
   ```

4. **Serve the client:**
   
   The built client files are in `client/dist/`. Serve them using nginx, Caddy, or any static file server.

### Health Checks

The server exposes a `/health` endpoint that checks:
- Database connectivity
- Redis connectivity

Returns `200 OK` if healthy, `503 Service Unavailable` if not.

## Licença

MIT (ver [LICENSE](LICENSE)).
