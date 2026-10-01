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