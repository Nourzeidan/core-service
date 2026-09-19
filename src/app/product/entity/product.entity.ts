
export class Product {
    id: number;
    restaurantId: number;
    categoryId: number | null;
    name: string;
    description: string;
    imageURL: string;
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;

    constructor(data: Partial<Product>){
        this.id = data.id!;
        this.restaurantId = data.restaurantId!;
        this.categoryId = data.categoryId ?? null;
        this.name = data.name!;
        this.description = data.description!;
        this.imageURL = data.imageURL!;
        this.createdAt = data.createdAt ?? new Date();
        this.updatedAt = data.updatedAt ?? new Date();
        this.deletedAt = data.deletedAt ?? null;
    }
}