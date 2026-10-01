# core-service

A microservices-oriented backend for a food delivery platform, built with Node.js, TypeScript, and Express. This service handles restaurant onboarding, role-based staff management, branch/location data, and product catalogs, backed by PostgreSQL with PostGIS for geospatial queries.

> **Status:** In active development. Core auth, RBAC, restaurant, branch, and product modules are implemented and tested; order/delivery/payment modules are planned next.

## Tech Stack

- **Runtime:** Node.js, TypeScript
- **Framework:** Express 5
- **Database:** PostgreSQL + PostGIS (geospatial queries)
- **Query builder / migrations:** Knex.js
- **Dependency injection:** tsyringe
- **Validation:** class-validator / class-transformer
- **Auth:** JWT (access + refresh tokens), bcrypt password hashing
- **Caching:** In-memory permission cache (Redis/Memurai-ready for production)

## Features

- **Auth** — register, login, forgot/reset password, OTP-based invite acceptance for staff onboarding
- **RBAC (Role-Based Access Control)** — restaurant-scoped roles (owner, branch manager, staff) with permission-based middleware, branch-level access control, and a cached permission lookup layer
- **Restaurants** — CRUD, owner-managed updates, admin-only status approval workflow
- **Branches** — CRUD, geospatial "nearby branches" search via PostGIS (`ST_DWithin`, `ST_MakePoint`), branch-level staff access scoping
- **Products** — category management, branch-specific pricing/availability, soft-deletable catalog items
- **Pagination & filtering** — cursor-based pagination with configurable sort order, dynamic whitelisted filters (`eq`, `gt`, `lt`, `lte`, `gte`, `in`, `like`) reusable across list endpoints

## Architecture

The codebase follows a layered architecture per feature module:

```
Route → Middleware (auth / rbac) → Controller → Service → Repository → Database
```

- **Routes** define endpoints and wire in middleware (`authenticate`, `requireRestaurantMember`, `requireBranchAccess`, `rbac`)
- **Controllers** validate input (DTOs) and format responses
- **Services** contain business logic and orchestrate repositories; multi-table writes are wrapped in transactions
- **Repositories** are the only layer that talks to the database directly via Knex

Dependencies are wired through a DI container (`tsyringe`) rather than services instantiating each other directly, so shared logic (e.g., user creation) lives in exactly one place and is reused across modules instead of duplicated.

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL with the PostGIS extension enabled
- (Optional, for production-style caching) Redis or Memurai

### Setup

```bash
# install dependencies
npm install

# copy and configure environment variables
cp .env.example .env

# run database migrations
npx knex migrate:latest --knexfile src/common/knex/knexfile.ts

# (optional) seed roles and permissions
npx knex seed:run --knexfile src/common/knex/knexfile.ts

# start the dev server
npm run dev
```

### Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | Secret for signing access tokens |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens |
| `NODE_ENV` | `development` / `production` |
| `PORT` | Server port (default `3000`) |

> Adjust this table to match your actual `.env.example` — fill in any additional variables (e.g. Redis connection, mail/SMTP config) your setup requires.

## Database

PostgreSQL schema includes:

- `users` — account identity, shared across all user types (customers, restaurant staff, admins)
- `restaurants` — core restaurant records, status workflow (`pending` → `active`, admin-approved)
- `restaurant_branches` — physical locations with PostGIS geography columns for proximity search
- `roles`, `permissions`, `role_permissions` — RBAC permission model
- `restaurant_members` — links a user to a restaurant with a specific role
- `member_branches` — scopes staff access to specific branches
- `products`, `product_categories`, `product_branch_details` — catalog data, with per-branch pricing/availability via a DB trigger that auto-creates branch-detail rows on product insert

## API Overview

All protected routes require a Bearer token (JWT) and are scoped by restaurant/branch membership where applicable.

- `POST /auth/register` — register a new user (restaurant owners provide restaurant details at signup)
- `POST /auth/login` — returns access + refresh tokens, including restaurant role/branch scope in the JWT payload
- `POST /auth/accept-invite` — staff accept an OTP-based invite and set their password
- `GET /restaurants`, `GET /restaurants/:id`, `PATCH /restaurants/:id` — restaurant management
- `GET /restaurants/:restaurantId/branches`, `POST .../branches`, `PATCH /branches/:id` — branch management, including `GET /branches/nearby` for geospatial search
- `GET /restaurants/:restaurantId/products`, `POST .../products`, `PATCH /products/:id` — product management
- `GET/POST/PATCH/DELETE /restaurants/:restaurantId/members` — staff management (invite, list, update role/status, assign branches)
- `GET /roles/:role/permissions` — public endpoint to inspect a role's permission set

## Testing

Manual/integration testing has been done via Postman against a live PostgreSQL instance, covering the full register → invite → accept → login → permission-check flow. Automated test coverage is planned next.

## Roadmap

- [ ] Order management module
- [ ] Delivery/dispatch module
- [ ] Payment integration
- [ ] Automated test suite (unit + integration)
- [ ] Redis-backed permission cache for production