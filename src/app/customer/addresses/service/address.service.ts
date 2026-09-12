import { AddressNotFoundError } from "../../errors.js";
import type { CreateAddressDTO, UpdateAddressDTO } from "../dto/address.dto.js";
import { createAddress, findAllAddressesByUserId, resetDefaultAddress, findAddressById, updateAddress, deleteAddress} from "../repository/address.repo.js";
export class AddressService {
    createAddress = async (userId: number, dto: CreateAddressDTO) => {
        const existing = await findAllAddressesByUserId(userId);
        if(dto.isDefault) {
            await resetDefaultAddress(userId);
        }
        const isDefault = existing.length === 0 ? true : dto.isDefault;
        const now = new Date();
        const newAddress = await createAddress({
                 userId,
                label: dto.label,
                lat: dto.lat,
                lng: dto.lng,
                apartment: dto.apartment,
                country: dto.country,
                building: dto.building,
                city: dto.city,
                street: dto.street,
                type: dto.type,
                createdAt: now,
                isDefault: isDefault
            });
          return {
            "message": "Address created!",
            address: {
            id: newAddress.id,
            label: newAddress.label,
            lat: newAddress.lat,
            lng: newAddress.lng,
            apartment: newAddress.apartment,
            country: newAddress.country,
            building: newAddress.building,
            city: newAddress.city,
            street: newAddress.street,
            type: newAddress.type,
            created_at: newAddress.createdAt,
            is_default: newAddress.isDefault
            }};
    }

    updateAddressService = async (userId: number, dto: UpdateAddressDTO, id: number) => {
        const address = await findAddressById(id);
        if (!address) {
                throw AddressNotFoundError;
            }

        if (dto.isDefault) {
            await resetDefaultAddress(userId);
        }
        const updatedData = {
            label: dto.label ?? address.label,
            lat: dto.lat ?? address.lat,
            lng: dto.lng ?? address.lng,
            apartment: dto.apartment !== undefined ? dto.apartment : address.apartment,
            country: dto.country ?? address.country,
            building: dto.building !== undefined ? dto.building : address.building,
            city: dto.city ?? address.city,
            street: dto.street ?? address.street,
            type: dto.type ?? address.type,
            isDefault: dto.isDefault ?? address.isDefault
        };

        const newAddress = await updateAddress(id, userId, updatedData);
          return {
            "message": "Address updated!",
            address: {
            id: newAddress.id,
            label: newAddress.label,
            lat: newAddress.lat,
            lng: newAddress.lng,
            apartment: newAddress.apartment,
            country: newAddress.country,
            building: newAddress.building,
            city: newAddress.city,
            street: newAddress.street,
            type: newAddress.type,
            created_at: newAddress.createdAt,
            is_default: newAddress.isDefault
            }};
    }

    deleteAddressRec = async (id: number) => {
        if (!id) {
                throw AddressNotFoundError;
            }
        deleteAddress(id);
        return {
            "message": "address deleted!"
        }
    }

    findAddresses = async (userId: number) => {
        const addresses = await findAllAddressesByUserId(userId);
        return addresses;
    }

}

export const addressService = new AddressService();