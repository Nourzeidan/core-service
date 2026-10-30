import type { Knex } from "knex";

// Remembers how much stock each order took, per branch + product.
// Needed for two things:
//   1. release: POST .../stock/release only receives { orderPublicId }, so core must know
//      what to give back.
//   2. idempotency: order-service RETRIES reserve on timeouts. The unique key makes a second
//      reserve for the same order a no-op instead of a second stock decrement.
export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
        CREATE TABLE stock_reservations (
            id BIGSERIAL PRIMARY KEY,
            order_public_id TEXT NOT NULL,
            branch_id BIGINT NOT NULL,
            product_id BIGINT NOT NULL,
            quantity INT NOT NULL CHECK (quantity > 0),
            status TEXT NOT NULL CHECK (status IN ('reserved', 'released')),
            created_at TIMESTAMP NOT NULL,
            released_at TIMESTAMP,

            CONSTRAINT fk_stock_reservations_branch_id FOREIGN KEY (branch_id) REFERENCES restaurant_branches(id),
            CONSTRAINT fk_stock_reservations_product_id FOREIGN KEY (product_id) REFERENCES products(id),
            CONSTRAINT uq_stock_reservations_order_branch_product UNIQUE (order_public_id, branch_id, product_id)
        );

        CREATE INDEX idx_stock_reservations_order_branch ON stock_reservations(order_public_id, branch_id);
    `);
}

export async function down(knex: Knex): Promise<void> {
    await knex.raw(`DROP TABLE IF EXISTS stock_reservations;`);
}
