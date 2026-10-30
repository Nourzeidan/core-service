import type { Knex } from "knex";

// Permissions used by order-service. They live here because core owns roles/permissions;
// order-service asks for them via GET /api/internal/roles/:roleName/permissions.
// Names follow the "<service>:<resource>" + action style of the core:* ones
// (contract: order-service/docs/business-logic/rbac.md §1).
//
// refund / assign / payout_create are admin-only today (admin bypasses rbac) but seeded
// so a role can be granted them later without a code change.
const ORDER_PERMISSIONS = [
    "order:order:read",
    "order:order:accept",
    "order:order:update",
    "order:order:cancel",
    "order:payment:read",
    "order:payment:refund",
    "order:delivery:assign",
    "order:finance:read",
    "order:finance:payout_create"
];

export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
        INSERT INTO permissions (resource, action, created_at) VALUES
        ('order:order', 'read', NOW()),
        ('order:order', 'accept', NOW()),
        ('order:order', 'update', NOW()),
        ('order:order', 'cancel', NOW()),
        ('order:payment', 'read', NOW()),
        ('order:payment', 'refund', NOW()),
        ('order:delivery', 'assign', NOW()),
        ('order:finance', 'read', NOW()),
        ('order:finance', 'payout_create', NOW())
        ON CONFLICT (resource, action) DO NOTHING;
    `);

    // Owner gets ALL order permissions
    await knex.raw(`
        INSERT INTO role_permissions (role_id, permission_id, created_at)
        SELECT r.id, p.id, NOW() FROM roles r, permissions p
        WHERE r.name = 'owner'
        AND p.resource LIKE 'order:%'
        ON CONFLICT DO NOTHING;
    `);

    // Branch Manager - run the orders of their branches + see finance
    await knex.raw(`
        INSERT INTO role_permissions (role_id, permission_id, created_at)
        SELECT r.id, p.id, NOW() FROM roles r, permissions p
        WHERE r.name = 'branch_manager'
        AND p.resource || ':' || p.action IN (
            'order:order:read',
            'order:order:accept',
            'order:order:update',
            'order:order:cancel',
            'order:finance:read'
        )
        ON CONFLICT DO NOTHING;
    `);

    // Staff - handle orders only (no cancel, no money)
    await knex.raw(`
        INSERT INTO role_permissions (role_id, permission_id, created_at)
        SELECT r.id, p.id, NOW() FROM roles r, permissions p
        WHERE r.name = 'staff'
        AND p.resource || ':' || p.action IN (
            'order:order:read',
            'order:order:accept',
            'order:order:update'
        )
        ON CONFLICT DO NOTHING;
    `);
}

// removes only what this migration added (the core:* permissions are untouched)
export async function down(knex: Knex): Promise<void> {
    await knex("role_permissions")
        .whereIn("permission_id", knex("permissions").select("id").whereRaw("resource || ':' || action = ANY(?)", [ORDER_PERMISSIONS]))
        .delete();
    await knex("permissions").whereRaw("resource || ':' || action = ANY(?)", [ORDER_PERMISSIONS]).delete();
}
