import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
        CREATE TABLE product_categories (
            id BIGSERIAL PRIMARY KEY,
            restaurant_id BIGINT NOT NULL,
            name TEXT NOT NULL,
            created_at TIMESTAMP NOT NULL,
            updated_at TIMESTAMP NOT NULL,

            CONSTRAINT fk_product_categories_restaurant_id FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
            CONSTRAINT uq_product_categories_restaurant_id_name UNIQUE (restaurant_id, name)
        );

        CREATE INDEX idx_product_categories_restaurant_id ON product_categories(restaurant_id);
    `);
}

export async function down(knex: Knex): Promise<void> {
    await knex.raw(`DROP TABLE product_categories;`);
}


