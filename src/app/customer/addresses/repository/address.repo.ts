import { useContainer } from "class-validator";
import {db} from "../../../../common/knex/knex.js";
import {CustomerAddress} from "../entity/addresses.entity.js";
const ADDRESS_COLUMNS = [
    "id",
    "user_id",
    "label",
    "lat",
    "lng",
    "apartment",
    "country",
    "building",
    "city",
    "street",
    "type",
    "created_at",
    "is_default"
];

function toEntity(address: any): CustomerAddress {
    return new CustomerAddress({
        id: address.id,
        userId: address.user_id,
        label: address.label,
        lat: address.lat,
        lng: address.lng,
        apartment: address.apartment,
        country: address.country,
        building: address.building,
        city: address.city,
        street: address.street,
        type: address.type,
        createdAt: address.created_at,
        isDefault: address.is_default
    });
}

// returns all addresses for the customer
export async function findAllAddressesByUserId(userId: number): Promise<CustomerAddress[]> {
    const rows = await db("customer_addresses")
        .select(ADDRESS_COLUMNS)
        .where("user_id", userId)
        .orderBy('id', 'desc')

    return rows.map(toEntity)
}

// return a specific address by its id
export async function findAddressById(id: number): Promise<CustomerAddress | null> {
    const row = await db("customer_addresses")
        .select(ADDRESS_COLUMNS)
        .where("id", id)
        .first();
    return row ? toEntity(row) : null;
}

export async function createAddress(address: Partial <CustomerAddress>): Promise<CustomerAddress> {
    const [newAddress] = await db('customer_addresses')
        .insert({
            user_id: address.userId,
            label: address.label,
            lat: address.lat,
            lng: address.lng,
            apartment: address.apartment,
            country: address.country,
            building: address.building,
            city: address.city,
            street: address.street,
            type: address.type,
            created_at: address.createdAt,
            is_default: address.isDefault
        })
        .returning(ADDRESS_COLUMNS);
    return toEntity(newAddress);
}

export async function updateAddress(id: number, userId: number, address: Partial <CustomerAddress>): Promise<CustomerAddress> {
    const [newAddress] = await db('customer_addresses')
    .where({id, user_id: userId})
        .update({
            // user_id: address.userId,
            label: address.label,
            lat: address.lat,
            lng: address.lng,
            apartment: address.apartment,
            country: address.country,
            building: address.building,
            city: address.city,
            street: address.street,
            type: address.type,
            created_at: address.createdAt,
            is_default: address.isDefault
        })
        .returning(ADDRESS_COLUMNS);
    return toEntity(newAddress);
}

export async function deleteAddress(id: number) {
     await db('customer_addresses')
        .where('id', id)
        .delete()
}

export async function resetDefaultAddress(userId: number) {
    await db("customer_addresses")
        .where("user_id", userId)
        .update({ is_default: false })
}
