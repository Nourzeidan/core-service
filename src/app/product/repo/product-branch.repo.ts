import { ProductBranchDetails } from "../entity/product-branch.entity.js";
import { db } from "../../../lib/knex/knex.js";
import type { Knex } from "knex";

const PRODUCT_BRANCH_DETAILS_COLUMNS = [
    "id",
    "branch_id",
    "product_id",
    "price",
    "stock",
    "is_available",
    "created_at",
    "updated_at"
];

function toEntity(details: any): ProductBranchDetails {
    return new ProductBranchDetails({
        id: details.id,
        branchId: details.branch_id,
        productId: details.product_id,
        price: details.price,
        stock: details.stock,
        isAvailable: details.is_available,
        createdAt: details.created_at,
        updatedAt: details.updated_at
    });
}

// the products of one branch that order-service has in a cart (one query for the whole cart).
// soft-deleted products are left out -> order-service treats a missing id as "not on the menu"
export async function findBranchProductsByIds(branchId: number, productIds: number[], conn: Knex = db) {
    const rows = await conn("product_branch_details as b")
        .join("products as p", "b.product_id", "p.id")
        .select("p.id as product_id", "p.name", "p.image_url", "b.price", "b.stock", "b.is_available")
        .where("b.branch_id", branchId)
        .whereIn("b.product_id", productIds)
        .whereNull("p.deleted_at");

    return rows.map(row => ({
        productId: Number(row.product_id),
        name: row.name as string,
        imageUrl: (row.image_url ?? null) as string | null,
        price: String(row.price),           // DECIMAL kept as a string ("55.00"): order-service converts it without float math
        stock: Number(row.stock),
        isAvailable: Boolean(row.is_available)
    }));
}

// FOR UPDATE locks these rows until the transaction ends, so two orders reserving the
// same product at the same moment run one after the other (no overselling)
export async function lockBranchStock(branchId: number, productIds: number[], conn: Knex): Promise<ProductBranchDetails[]> {
    const rows = await conn("product_branch_details as b")
        .join("products as p", "b.product_id", "p.id")
        .select(PRODUCT_BRANCH_DETAILS_COLUMNS.map(col => `b.${col}`))
        .where("b.branch_id", branchId)
        .whereIn("b.product_id", productIds)
        .whereNull("p.deleted_at")
        .forUpdate();

    return rows.map(toEntity);
}

// relative update (stock = stock + delta) instead of writing an absolute value -> correct even
// if the row changed since we read it. returns the row after the change
export async function changeBranchStock(branchId: number, productId: number, delta: number, conn: Knex): Promise<{stock: number; isAvailable: boolean}> {
    const [row] = await conn("product_branch_details")
        .where({ branch_id: branchId, product_id: productId })
        .update({
            stock: conn.raw("stock + ?", [delta]),
            updated_at: new Date()
        })
        .returning(["stock", "is_available"]);

    return { stock: Number(row.stock), isAvailable: Boolean(row.is_available) };
}

export async function updateBranchDetails(data: Partial<ProductBranchDetails>, branchId: number, productId: number, conn: Knex = db): Promise<ProductBranchDetails | null> {
    const [row] = await conn("product_branch_details")
        .update({
            price: data.price,
            stock: data.stock,
            is_available: data.isAvailable,
            updated_at: data.updatedAt ?? new Date()
        })
        .where({ branch_id: branchId, product_id: productId })
        .returning(PRODUCT_BRANCH_DETAILS_COLUMNS);

    if (!row) {
        return null;
    }
    return toEntity(row);
}