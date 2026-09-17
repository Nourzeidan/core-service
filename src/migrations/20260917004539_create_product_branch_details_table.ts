import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
        CREATE TABLE product_branch_details (
            id BIGSERIAL PRIMARY KEY,
            branch_id BIGINT NOT NULL,
            product_id BIGINT NOT NULL,
            price DECIMAL(10, 2) NOT NULL,
            stock BIGINT NOT NULL,
            is_available BOOLEAN NOT NULL,
            created_at TIMESTAMP NOT NULL,
            updated_at TIMESTAMP NOT NULL,

            CONSTRAINT fk_product_branch_details_branch_id FOREIGN KEY (branch_id) REFERENCES restaurant_branches(id),
            CONSTRAINT fk_product_branch_details_product_id FOREIGN KEY (product_id) REFERENCES products(id),
            CONSTRAINT uq_product_branch_details_branch_product UNIQUE (branch_id, product_id)
        );

        CREATE INDEX idx_product_branch_details_branch_id ON product_branch_details(branch_id);
        CREATE INDEX idx_product_branch_details_product_id ON product_branch_details(product_id);

        CREATE FUNCTION trg_product_after_insert_fn() RETURNS TRIGGER AS $$
        BEGIN
            INSERT INTO product_branch_details (branch_id, product_id, price, stock, is_available, created_at, updated_at)
            SELECT b.id, NEW.id, 0, 0, false, now(), now()
            FROM restaurant_branches b
            WHERE b.restaurant_id = NEW.restaurant_id;

            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        CREATE TRIGGER trg_product_after_insert
        AFTER INSERT ON products
        FOR EACH ROW
        EXECUTE FUNCTION trg_product_after_insert_fn();
    `);
}

export async function down(knex: Knex): Promise<void> {
    await knex.raw(`
        DROP TRIGGER IF EXISTS trg_product_after_insert ON products;
        DROP FUNCTION IF EXISTS trg_product_after_insert_fn();
        DROP TABLE IF EXISTS product_branch_details;
    `);
}