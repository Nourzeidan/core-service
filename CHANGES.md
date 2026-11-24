# core-service — changes to work with order-service

Date: 2026-10-30

This file lists what was added to core-service so order-service can talk to it. The ideas come
from core-service-example. The exact paths, response shapes and event names come from
**order-service's own contract** (`order-service/docs/integrations.md` and
`order-service/docs/business-logic/rbac.md`), because that is what your order-service calls.

Where core-service-example and order-service disagree (e.g. the example uses
`/internal/branches/:id/reserve-stock` and `orders:read`, order-service expects
`/internal/branches/:id/stock/reserve` and `order:order:read`), order-service wins.

Things that were only **named differently** in the example (`rest.controller.ts`, `repo/` vs
`repository/`, `customer/addresses` vs `customer-address`, `admin` vs `system_admin`,
`DB_USER` vs `DB_USERNAME`, ...) were **not** changed.

---

## 0. What you must do before running

```bash
cd core-service
npm install            # already done: adds amqp-connection-manager, amqplib, croner, @types/amqplib
npm run migrate        # REQUIRED: until this runs, every branch endpoint fails ("column delivery_fee does not exist")
```

Add to `core-service/.env`:

```env
INTERNAL_API_KEY=<long random string>              # must equal order-service CORE_INTERNAL_API_KEY
RABBITMQ_URL=amqp://guest:guest@localhost:5672     # same broker as order-service
RABBITMQ_CORE_EVENTS_EXCHANGE=core.events
```

In `order-service/.env`, check that:

- `ACCESS_SECRET` is identical to core's `ACCESS_SECRET` (order-service verifies core's tokens).
- `CORE_SERVICE_BASE_URL=http://localhost:3000` (no `/api`; order-service adds `/api/internal/...` itself).
- `CORE_INTERNAL_API_KEY` is the same value as core's `INTERNAL_API_KEY`.

Run three processes:

```bash
npm run dev            # core API          (core-service)
npm run worker:dev     # core outbox worker (core-service)  <- NEW, publishes events to RabbitMQ
npm run dev            # order-service
```

---

## 1. How the two services talk (big picture)

```
            sync HTTP  (order -> core)                       async RabbitMQ (core -> order)
order-service ──GET/POST /api/internal/*──▶ core-service      core-service ─▶ events_outbox (same DB trx)
   header  api-key: <shared secret>                                │
   header  X-Correlation-ID                                         ▼
                                                              src/worker.ts ── publish ──▶ exchange core.events
                                                                                              │ routing key = event type
                                                                                              ▼
                                                                         order-service queue (product.#, branch.#, ...)
```

- **Sync** (order asks core): checkout needs the branch, products, prices, address and stock *now*.
- **Async** (core tells order): when something changes in core, order-service must drop its cached
  copy. Core doesn't call order-service; it publishes an event and whoever cares listens.
- **JWT**: core issues tokens, and order-service only verifies them with the same `ACCESS_SECRET`.

---

## 2. Infrastructure added

| File | What / why |
|---|---|
| `src/pkg/messaging/message-broker.interface.ts` | Producer interface (`connect`, `close`, `declareExchange`, `publish`). |
| `src/pkg/messaging/rabbitmq.ts` | RabbitMQ client on `amqp-connection-manager`: auto-reconnect, **confirm channel** (publish resolves only after the broker ACKs), 10 s publish timeout. Every caller of `connect()` waits for the same connection, so nothing runs while the broker is down. |
| `src/lib/events/event-types.ts` | The 6 event names + the payload type of each (`EventPayloads`). |
| `src/lib/events/types.ts` | `OutboxRow`, `InsertOutboxInput`, `EventEnvelope`. |
| `src/lib/events/outbox.repo.ts` | `insertOutboxEvent(input, trx)`. **trx is mandatory** (no default) so the event is always committed with the change. Also `claimPendingEvents` (FOR UPDATE SKIP LOCKED), `markEventDispatched` and `markEventFailed`. |
| `src/lib/events/outbox-drain.ts` | One pass: lock pending rows → publish → stamp `dispatched_at` after the ACK. Stops at the first failure. |
| `src/lib/events/init.ts` | The `messageBroker` instance (only the worker imports it). |
| `src/worker.ts` | **Separate process.** Runs the drain on a croner schedule (every second by default, `protect: true` = no overlapping runs). Has graceful shutdown. |
| `src/lib/auth/api-key.ts` | `requireInternalApiKey`. Checks the `api-key` header with a constant-time compare. Fails closed: no key configured → 503. |
| `src/lib/idempotency/idempotency.ts` | `Idempotency-Key` middleware (Redis): a retried POST with the same key replays the first response and status. Used optionally on `/auth/forget-password` and `POST /restaurant`. |
| `src/lib/utils/cookie.ts` | `setAuthCookies` / `setAccessTokenCookie`, used by login and refresh. |
| `src/lib/correlation/correlationId.ts` | **Changed:** reuses an incoming `X-Correlation-ID` (order-service sends one), so one id appears in both services' logs. |

### Why the outbox (the one thing to really understand)

The naive version is "update the branch, then publish to RabbitMQ". It breaks in two ways:

- If the process crashes between the two steps, the event is lost forever and order-service keeps a stale cache.
- If RabbitMQ is down, the request either fails or loses the event.

The fix has two parts:

1. The service writes the event as a row in `events_outbox` **in the same DB transaction** as the
   change, so both are saved or neither is.
2. The worker publishes rows later and marks them dispatched only after the broker ACK.

The worst case is that an event is published **twice**. That's harmless: `eventId` stays the same,
and order-service dedupes on it (`core-events:dedupe:<eventId>` in Redis).

---

## 3. Migrations added (`npm run migrate`)

| Migration | What |
|---|---|
| `20261030100000_create_events_outbox_table` | Outbox table + partial index on pending rows. |
| `20261030100100_alter_restaurant_branches_add_delivery_fee` | `delivery_fee INT NOT NULL DEFAULT 0` in **minor units** (1500 = 15.00). |
| `20261030100200_seed_order_service_permissions_table` | `order:order:{read,accept,update,cancel}`, `order:payment:{read,refund}`, `order:delivery:assign`, `order:finance:{read,payout_create}`. Owner gets all of them, branch_manager gets order:* + finance:read, staff gets read/accept/update. |
| `20261030100300_create_stock_reservations_table` | Remembers what stock each order took (needed for release + safe retries). Unique on `(order_public_id, branch_id, product_id)`. |
| `20261030100400_alter_users_allow_delivery_agent` | The users CHECK constraint did not allow `delivery_agent` (registering one gave a 500). |

All 5 were tested by running them inside a transaction that was then rolled back (up, the queries, then
down). Your database was not changed.

Also fixed in `package.json`: `migrate` / `migrate:make` pointed to `src/common/knex/knexfile.ts`, which
doesn't exist. They now use `src/lib/knex/knexfile.ts` (same `tsx` style as before). Added
`migrate:rollback`, `worker:dev` and `worker`.

`.env.example` was rewritten: the old one used names `env.ts` never read (`JWT_ACCESS_SECRET`, ...).
Note that `ACCESS_EXPIRES_IN` / `REFRESH_EXPIRES_IN` are **seconds** (`utils.ts` does `Number(...)`, so `15m` would break).

---

## 4. Internal API (`/api/internal/*`, order-service only)

All internal routers are mounted **once** in `src/routes.ts` behind `requireInternalApiKey`, so a new
internal route can't be exposed by forgetting the guard. Each module still owns its routes: every
`routes.ts` exports an extra `xxxInternalRouter`. Responses are **raw JSON** (no `{success, data}`
wrapper) because order-service reads the body as-is.

| Endpoint | Returns | Where |
|---|---|---|
| `GET /internal/branches/:id` | `{id, restaurantId, countryCode, currency, lat, lng, isActive, acceptOrders, deliveryFee, commission, deliveryRadiusKm}` | branch `findById` |
| `GET /internal/restaurants/:id` | `{id, ownerId, name, status}` | restaurant `findSummaryById` |
| `GET /internal/branches?ids=1,2,3` (max 100) | `[branch snapshot, ...]`, one `WHERE id IN`; unknown ids left out; bad list → 400 | branch `findByIds` |
| `GET /internal/restaurants?ids=1,2,3` (max 100) | `[{id, ownerId, name, status}, ...]`, one query; unknown ids left out | restaurant `getSummariesByIds` |
| `POST /internal/stock/release` `{orders: [{branchId, orderPublicId}]}` (max 100) | 204 — releases many orders in one transaction | product `releaseStockBatch` |
| `GET /internal/customers/:userId/addresses/:id` | `{id, userId, lat, lng, addressText}`; 404 if it isn't that user's address | address `findOwnedAddress` |
| `POST /internal/branches/:id/products/batch` `{productIds}` | `[{productId, name, imageUrl, price: "55.00", stock, isAvailable}]` | product `findBranchProducts` |
| `POST /internal/branches/:id/stock/reserve` `{orderPublicId, items:[{productId, quantity}]}` | 204, or 409 `Out of stock: [{productId, requested, available}]` | product `reserveStock` |
| `POST /internal/branches/:id/stock/release` `{orderPublicId}` | 204 | product `releaseStock` |
| `GET /internal/roles/:roleName/permissions` | `["order:order:read", ...]` | member `getRolePermissionNames` |
| `GET /internal/users?ids=1,2,3` | `[{id, name, phone}]` (no email / password hash) | user `findContactsByIds` |

pg returns `BIGINT` and `DECIMAL` columns as strings, so ids, lat/lng and stock are converted to numbers.
`price` stays a string on purpose: order-service converts `"55.00"` to `5500` with string math, never floats.

### Stock reserve / release (how it stays correct)

- **All or nothing.** The product rows are locked `FOR UPDATE`, every quantity is checked, and then all
  are decremented. If one is short, nothing changes and you get a 409.
- **No overselling.** The row lock makes two orders for the same product run one after the other.
- **Safe to retry.** order-service retries on timeouts. The reservation is stored under `orderPublicId`,
  so a second reserve for the same order returns 204 without decrementing again. If two copies arrive
  at the same instant, the unique key rejects the second (pg code `23505`), which is treated as "already done".
- **Release** restocks only rows still `reserved` and marks them `released`, so a repeated release does nothing.
- The same product listed twice in a cart is summed into one line.
- Each stock change emits `product.stock.changed` in the same transaction.
- **No query per product (2026-11-10).** A whole cart is one `UPDATE … FROM (VALUES …)` (`changeBranchStocks`), one
  multi-row outbox insert (`insertOutboxEvents`) and, for releases, one reservation update (`markReservationsReleased`).
  Before, it was 2–3 queries per product. The batch release does the same for up to 100 orders at once; the single
  release endpoint now goes through it.

---

## 5. Events now published (through the outbox)

| Event | Emitted when | Payload |
|---|---|---|
| `branch.updated` | `PATCH /branches/:id`, or the status set back to active | `{branchId}` |
| `branch.deactivated` | `PATCH /branches/:id/status` with `isActive: false` | `{branchId}` |
| `product.price.changed` | `PATCH /products/:id?branchId=` with `price` | `{branchId, productId, price}` |
| `product.stock.changed` | product update with `stock`/`isAvailable`, reserve, release | `{branchId, productId, stock, isAvailable}` |
| `restaurant.suspended` | `PATCH /restaurant/:id/status` → `suspended` | `{restaurantId}` |
| `rbac.permissions_changed` | **never yet**: core has no endpoint that edits role permissions. The constant is there for when one is added. | `{roleName}` |

Envelope (what order-service's consumer parses):
`{eventId, eventType, occurredAt, aggregateType, aggregateId, payload}`. The routing key is `eventType`, and the exchange is `core.events` (topic, durable).

---

## 6. Auth changes

| Change | Why |
|---|---|
| `authenticate` accepts `Authorization: Bearer` **or** the `access_token` cookie | Login already set the cookie but the guard ignored it. Same rule as order-service, so one token works on both. Also removed the `console.log` that printed every token. |
| `POST /auth/refresh` (new) | Refresh token from the cookie or `{refreshToken}` in the body → new access token (cookie + body). The payload is **rebuilt from the DB**, so role/branch changes apply on refresh. |
| `JwtPayload` has `restaurantId?`, `restaurantRole?`, `branchIds?` | They were already put in the token but missing from the type. order-service authorizes with them. |
| `buildTokenPayload()` in `AuthService` | One place builds the claims for login and refresh (login logic moved there unchanged). |
| `branchIds` are numbers | pg returned them as strings, so `branchIds.includes(5)` in `requireBranchAccess` was always false, both here and in order-service. |
| `findRestaurantMemberWithRole` returns `null` when not found | It crashed with a TypeError (500) for a member whose invite wasn't accepted yet. Callers already threw `MemberNotFoundError` on null. |
| Invalid/expired token → **401** (was 400 or 500) | `NotAuthenticated` is now 401, and `jwt.verify` errors are turned into it. Frontends refresh on 401. Also removed the `console.log` that printed the JWT secret. |

---

## 7. Other new endpoints / fields

- `POST /api/restaurant` (system admin): creates the owner user, the restaurant (ACTIVE) and the owner membership in one transaction.
- `PATCH /api/branches/:id/status` `{isActive}` (system admin): turns a branch on or off and emits an event.
- `PATCH /api/branches/:id/commission` `{commissionBps}` (system admin, int 0–10000; 1500 = 15%) — added 2026-11-18 for order-service Phase 4. Updates `restaurant_branches.commission` + `branch.updated` outbox event in one transaction, so order-service drops its cached branch and the next settlement uses the new rate. Owners can't change it (403).
- `deliveryFee` (int, minor units) is now optional in create/update branch and returned on update.

---

## 8. Verified

- `tsc --noEmit`: 0 errors (same as before the changes).
- Server boots. `/api/health` returns 200, and public routes behave as before.
- Internal routes: no key → 503, wrong key → 401. Restaurants, roles, users and addresses return the documented shapes.
  Bad input → 400.
- The new migrations and repo queries ran against your DB inside a rolled-back transaction (DB unchanged).
- The worker boots and waits for the broker without holding DB locks.
- **Not tested:** a real publish to RabbitMQ (no broker was running on localhost:5672), and the
  branch endpoints / reserve (they need `npm run migrate` first).

## 9. Noticed but NOT changed (your call)

- OTPs are logged in plain text (`auth.service.ts` forgetPassword, `member.service.ts`), and many debug
  `console.log`s print users/rows (`users.repo.ts`, `restaurant.repo.ts`, `rest.controller.ts`).
- `RegisterRestaurantDTO.logoURL` is optional but `restaurants.logo_url` is NOT NULL, so self-registering a
  restaurant without a logo fails (the new admin endpoint sends `""` instead).
- The DB pool settings are still commented out in `knexfile.ts` (the example sets `pool.max`).
- `events_outbox` keeps dispatched rows forever. A periodic cleanup (e.g. delete dispatched rows older than 7 days) is worth adding later.
- `npm install` reported 4 vulnerabilities (1 moderate, 2 high, 1 critical) in the dependency tree. I did not check which packages they come from; run `npm audit` to see them.
