import { db } from "../../../common/knex/knex.js";
import { Branch } from "../entity/branch.entity.js";
import type { Knex } from "knex";
const BRANCH_COLUMNS = [
    "id",
    "restaurant_id",
    "country_code",
    "address_text",
    "label",
    "lat",
    "long",
    "is_active",
    "opens_at",
    "closes_at",
    "accept_orders",
    "created_at",
    "updated_at",
    "delivery_radius",
    "currency",
    "commission"
];

function toEntity(branch: any): Branch {
    return new Branch({
        id: branch.id,
        restaurantId: branch.restaurant_id,
        countryCode: branch.country_code,
        addressText: branch.address_text,
        label: branch.label,
        lat: branch.lat,
        long: branch.long,
        isActive: branch.is_active,
        opensAt: branch.opens_at,
        closesAt: branch.closes_at,
        acceptOrders: branch.accept_orders,
        createdAt: branch.created_at,
        updatedAt: branch.updated_at,
        deliveryRadius: branch.delivery_radius,
        currency: branch.currency,
        commission: branch.commission
    });
}

export async function createBranch(data: Partial<Branch>, conn: Knex = db): Promise<Branch> {
    const [row] = await conn("restaurant_branches")
        .insert({
            id: data.id,
            restaurant_id: data.restaurantId,
            country_code: data.countryCode,
            address_text: data.addressText,
            label: data.label,
            lat: data.lat,
            long: data.long,
            is_active: data.isActive,
            opens_at: data.opensAt,
            closes_at: data.closesAt,
            accept_orders: data.acceptOrders,
            created_at: data.createdAt ?? new Date(),
            updated_at: data.updatedAt ?? new Date(),
            delivery_radius: data.deliveryRadius,
            currency: data.currency,
            commission: data.commission
        })
        .returning(BRANCH_COLUMNS);

    return toEntity(row);
}

export async function findNearbyBranches(lat: number, lng: number): Promise<Branch[]>{
    const result = await db.raw(`
        SELECT
        b.id, b.restaurant_id, b.address_text, b.label, b.lat,
        b.long, b.is_active, b.accept_orders, b.currency, r.name,r.logo_url
        FROM restaurant_branches b JOIN restaurants r ON b.restaurant_id = r.id
        WHERE b.is_active = true and r.status = 'active'
        AND ST_DWithin(b.location, ST_MakePoint(?, ?)::geography, b.delivery_radius*1000)
    `,[lng, lat]);

    return result.rows;
}

