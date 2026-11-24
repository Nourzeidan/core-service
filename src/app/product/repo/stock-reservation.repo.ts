import type { Knex } from "knex";
import { db } from "../../../lib/knex/knex.js";
import { StockReservation } from "../entity/stock-reservation.entity.js";
import { ReservationStatus } from "../enums.js";

const STOCK_RESERVATION_COLUMNS = [
    "id",
    "order_public_id",
    "branch_id",
    "product_id",
    "quantity",
    "status",
    "created_at",
    "released_at"
];

function toEntity(row: any): StockReservation {
    return new StockReservation({
        id: Number(row.id),
        orderPublicId: row.order_public_id,
        branchId: Number(row.branch_id),
        productId: Number(row.product_id),
        quantity: Number(row.quantity),
        status: row.status,
        createdAt: row.created_at,
        releasedAt: row.released_at
    });
}

// forUpdate: lock the rows so two concurrent releases of the same order can't both restock
export async function findReservationsByOrder(orderPublicId: string, branchId: number, conn: Knex = db, forUpdate = false): Promise<StockReservation[]> {
    const query = conn("stock_reservations")
        .select(STOCK_RESERVATION_COLUMNS)
        .where({ order_public_id: orderPublicId, branch_id: branchId });
    const rows = forUpdate ? await query.forUpdate() : await query;
    return rows.map(toEntity);
}

export async function createReservations(rows: Partial<StockReservation>[], conn: Knex = db): Promise<void> {
    await conn("stock_reservations").insert(rows.map(row => ({
        order_public_id: row.orderPublicId,
        branch_id: row.branchId,
        product_id: row.productId,
        quantity: row.quantity,
        status: ReservationStatus.RESERVED,
        created_at: row.createdAt ?? new Date()
    })));
}

export async function markReservationReleased(id: number, conn: Knex = db): Promise<void> {
    await conn("stock_reservations")
        .where("id", id)
        .update({ status: ReservationStatus.RELEASED, released_at: new Date() });
}

// reservations of several orders in ONE query (batch release), locked when asked
export async function findReservationsByOrders(orders: {orderPublicId: string; branchId: number}[], conn: Knex, forUpdate = false): Promise<StockReservation[]> {
    if (orders.length === 0) {
        return [];
    }
    const query = conn("stock_reservations")
        .select(STOCK_RESERVATION_COLUMNS)
        .whereIn(["order_public_id", "branch_id"], orders.map(order => [order.orderPublicId, order.branchId]));
    const rows = forUpdate ? await query.forUpdate() : await query;
    return rows.map(toEntity);
}

// one UPDATE for every released reservation
export async function markReservationsReleased(ids: number[], conn: Knex): Promise<void> {
    if (ids.length === 0) {
        return;
    }
    await conn("stock_reservations")
        .whereIn("id", ids)
        .update({ status: ReservationStatus.RELEASED, released_at: new Date() });
}
