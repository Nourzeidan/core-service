import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
        CREATE TABLE products (
            id BIGSERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            image_url TEXT,
            restaurant_id BIGINT NOT NULL,
            category_id BIGINT,
            created_at TIMESTAMP NOT NULL,
            updated_at TIMESTAMP NOT NULL,
            deleted_at TIMESTAMP,
            CONSTRAINT fk_products_restaurant_id FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
            CONSTRAINT fk_products_category_id FOREIGN KEY (category_id) REFERENCES product_categories(id)
        );

        CREATE INDEX idx_products_restaurant_id ON products(restaurant_id);
        CREATE INDEX idx_products_created_at ON products(created_at);
    `);
}


export async function down(knex: Knex): Promise<void> {
    await knex.raw(`DROP TABLE products;`);
}

