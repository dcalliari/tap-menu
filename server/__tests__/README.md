# Server tests

These are Bun-native integration tests (using `bun:test`) that hit the Hono `app` via `app.fetch()`.

## Prerequisites

- Postgres + Redis running (recommended via the repo `docker-compose.yml`).
- Bun installed.

## Running

From `server/`:

- `bun run test`
- `bun run test:watch`

The test script sets `NODE_ENV=test` and a default `JWT_SECRET`.
If you want to override DB/Redis URLs:

- `TEST_DATABASE_URL=... REDIS_URL=... bun run test`
