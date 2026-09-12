# AGENTS.md

This repository is the backend API for the core service. Keep changes aligned with the existing Express + TypeScript + Knex structure described in [README.md](README.md), [src/app.ts](src/app.ts), and [src/routes.ts](src/routes.ts).

## Project shape

- App entrypoints live in [src/server.ts](src/server.ts) and [src/app.ts](src/app.ts).
- Feature modules are organized by domain under [src/app](src/app), with each feature typically containing:
  - `controller/`
  - `dto/`
  - `entity/`
  - `repository/`
  - `service/`
  - `errors.ts` and/or `enums.ts` when needed
- Shared infrastructure lives under [src/common](src/common), including config, logger, validation, time, auth guard, and error handling.
- Database migrations live under [src/migrations](src/migrations) and are run through the Knex config in [src/common/knex/knexfile.ts](src/common/knex/knexfile.ts).

## Key conventions

- Use TypeScript with ES modules. Import paths commonly use the `.js` extension even in TypeScript source (for example, `./controller/auth.controller.js`).
- Keep HTTP routes thin; route handlers should delegate to service methods and avoid business logic in the controller layer.
- Keep persistence logic inside repository files and keep domain logic in service files.
- Reuse the existing app error pattern from [src/common/error/AppError.ts](src/common/error/AppError.ts) and [src/common/error/errorHandler.ts](src/common/error/errorHandler.ts). Do not invent a separate error pattern.
- Follow the existing naming and folder structure for new features rather than creating a different architecture.
- Validate environment variables in [src/common/config/env.ts](src/common/config/env.ts). If a new env var is required, add it to the Zod schema there.

## Commands

Use the scripts in [package.json](package.json):

- `npm run build` — TypeScript compile check
- `npm run dev` — local dev server with watch mode
- `npm run start` — run built app
- `npm run migrate` — apply database migrations
- `npm run migrate:make` — create a new migration
- `npm run lint` — prettier check
- `npm run format` — format project files

## Auth and API patterns

- Route mounting is centralized in [src/routes.ts](src/routes.ts): `/api` is the root for app routes.
- Auth routes are defined in [src/app/auth/routes.ts](src/app/auth/routes.ts).
- User authentication uses JWTs and middleware under [src/common/auth](src/common/auth).
- Keep response payloads consistent with existing services and controllers; do not change established message keys or response structure unless intentionally updating a feature.

## Working rules for agents

- Prefer small, consistent edits that match the surrounding file layout.
- Do not add unused dependencies or broad refactors unless the task requires them.
- If you create a new feature, mirror the same feature folder pattern already used by auth/user modules instead of inventing a one-off layout.
- If a change affects database behavior, also review the relevant migration and repository code together.
- When fixing a bug, check the repository/service boundary first before changing controllers or route wiring.

## Relevant files to inspect first

- [src/app/auth/service/auth.service.ts](src/app/auth/service/auth.service.ts)
- [src/app/user/service/user.service.ts](src/app/user/service/user.service.ts)
- [src/app/user/repository/users.repo.ts](src/app/user/repository/users.repo.ts)
- [src/common/knex/knex.ts](src/common/knex/knex.ts)
- [src/common/config/env.ts](src/common/config/env.ts)

This repo is intentionally compact and feature-oriented; match that pattern closely when making changes.
