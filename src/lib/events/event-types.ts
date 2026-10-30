// Every event core publishes. The string is ALSO the RabbitMQ routing key, and
// order-service binds its queue with "product.#", "branch.#", "restaurant.#", "rbac.#",
// so a new event must start with one of those prefixes to reach it.
// Contract: order-service/docs/integrations.md §3.4
export const EVENT_TYPES = {
    PRODUCT_STOCK_CHANGED: "product.stock.changed",
    PRODUCT_PRICE_CHANGED: "product.price.changed",
    BRANCH_UPDATED: "branch.updated",
    BRANCH_DEACTIVATED: "branch.deactivated",
    RESTAURANT_SUSPENDED: "restaurant.suspended",
    // reserved: core has no endpoint that edits role permissions yet, so nothing emits it today
    RBAC_PERMISSIONS_CHANGED: "rbac.permissions_changed",
} as const;

export type EventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];

// payload shape per event. order-service uses these ids to build the cache keys it deletes
// (core:product:price:<branchId>:<productId>, core:branch:<branchId>, core:restaurant:<id>, core:rbac:perms:<roleName>)
export interface EventPayloads {
    "product.stock.changed": {branchId: number; productId: number; stock: number; isAvailable: boolean};
    "product.price.changed": {branchId: number; productId: number; price: string};
    "branch.updated": {branchId: number};
    "branch.deactivated": {branchId: number};
    "restaurant.suspended": {restaurantId: number};
    "rbac.permissions_changed": {roleName: string};
}
